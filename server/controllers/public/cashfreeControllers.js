const { supabase } = require("../../config/supabaseClient");
const crypto = require("crypto");
const { sendOrderEmails } = require("../../utils/emailService");
const { sendWhatsAppOrderNotification } = require("../../utils/sendWhatsApp");

// Cashfree configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL;
const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

// Generate unique Cashfree order ID
const generateCashfreeOrderId = () => {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create Cashfree Payment Order
 * @route POST /api/payments/cashfree/create-order
 * @desc Creates a Cashfree order and returns payment_session_id
 */
const createCashfreeOrder = async (req, res) => {
  try {
    const { orderDbId, amount, currency, customerDetails } = req.body;

    // Validate required fields
    if (!orderDbId || !amount || !customerDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderDbId, amount, customerDetails",
      });
    }

    // Generate unique order ID for Cashfree
    const cashfreeOrderId = generateCashfreeOrderId();

    // Prepare Cashfree API request payload
    const orderPayload = {
      order_id: cashfreeOrderId,
      order_amount: (amount / 100).toFixed(2), // Convert paise to rupees
      order_currency: currency || "INR",
      customer_details: {
        customer_id: `CUST_${orderDbId}`,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
      },
      order_meta: {
        return_url: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/checkout?order_id=${cashfreeOrderId}`,
        notify_url: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/api/payments/cashfree/webhook`,
      },
      order_note: `Order from Hani Industries`,
    };

    console.log("Creating Cashfree order:", {
      cashfreeOrderId,
      orderDbId,
      amount: orderPayload.order_amount,
    });

    // Call Cashfree API to create order
    const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(orderPayload),
    });

    const cashfreeData = await response.json();

    if (!response.ok) {
      console.error("Cashfree API error:", cashfreeData);
      return res.status(400).json({
        success: false,
        message: "Failed to create Cashfree order",
        error: cashfreeData.message || "Unknown error",
      });
    }

    // Update payment record with Cashfree details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        razorpay_order_id: cashfreeOrderId, // Reuse this field for Cashfree order ID
        payment_response: {
          cashfree_payment_session_id: cashfreeData.payment_session_id,
          cashfree_order_id: cashfreeOrderId,
        },
      })
      .eq("order_id", orderDbId)
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to update payment record:", paymentError);
    }

    // Log payment initiation
    if (payment) {
      await supabase.from("payment_logs").insert({
        payment_id: payment.id,
        event_type: "cashfree_order_created",
        event_data: {
          cashfree_order_id: cashfreeOrderId,
          payment_session_id: cashfreeData.payment_session_id,
          amount: orderPayload.order_amount,
        },
      });
    }

    console.log("Cashfree order created successfully:", cashfreeOrderId);

    return res.status(200).json({
      success: true,
      message: "Cashfree order created successfully",
      data: {
        payment_session_id: cashfreeData.payment_session_id,
        cashfree_order_id: cashfreeOrderId,
        order_id: cashfreeData.order_id,
      },
    });
  } catch (error) {
    console.error("Create Cashfree order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating Cashfree order",
      error: error.message,
    });
  }
};

/**
 * Cashfree Webhook Handler
 * @route POST /api/payments/cashfree/webhook
 * @desc Handles Cashfree webhook notifications for payment status updates
 */
const cashfreeWebhook = async (req, res) => {
  try {
    console.log("📥 Received Cashfree webhook");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = JSON.stringify(req.body);

    // ============================================
    // STEP 1: VERIFY WEBHOOK SIGNATURE
    // ============================================
    if (!signature) {
      console.error("❌ Missing webhook signature");
      return res.status(401).json({
        success: false,
        message: "Missing webhook signature",
      });
    }

    // Generate expected signature
    const signatureData = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", CASHFREE_WEBHOOK_SECRET)
      .update(signatureData)
      .digest("base64");

    // Verify signature
    if (signature !== expectedSignature) {
      console.error("❌ Invalid webhook signature");
      console.log("Expected:", expectedSignature);
      console.log("Received:", signature);
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    console.log("✅ Webhook signature verified");

    // ============================================
    // STEP 2: PARSE WEBHOOK PAYLOAD
    // ============================================
    const { type, data } = req.body;

    if (!type || !data) {
      console.error("❌ Invalid webhook payload");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    const orderDetails = data.order;
    const paymentDetails = data.payment;
    const cashfreeOrderId = orderDetails.order_id;

    console.log(`📦 Webhook Type: ${type}`);
    console.log(`📦 Cashfree Order ID: ${cashfreeOrderId}`);
    console.log(`💰 Payment Status: ${orderDetails.order_status}`);

    // ============================================
    // STEP 3: GET PAYMENT RECORD FROM DATABASE
    // ============================================
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*, orders!inner(*)")
      .eq("razorpay_order_id", cashfreeOrderId) // We stored Cashfree order ID here
      .single();

    if (fetchError || !payment) {
      console.error("❌ Payment record not found:", cashfreeOrderId);
      // Still return 200 to acknowledge webhook
      return res.status(200).json({ received: true });
    }

    const orderDbId = payment.order_id;
    const orderData = payment.orders;

    console.log(`📝 Found order in DB: ${orderData.order_id}`);

    // ============================================
    // STEP 4: UPDATE ORDER STATUS BASED ON PAYMENT STATUS
    // ============================================
    let paymentStatus = "pending";
    let orderStatus = "pending";

    switch (orderDetails.order_status) {
      case "PAID":
      case "ACTIVE":
        paymentStatus = "captured";
        orderStatus = "confirmed";
        console.log("✅ Payment successful");
        break;

      case "EXPIRED":
      case "TERMINATED":
        paymentStatus = "failed";
        orderStatus = "payment_failed";
        console.log("❌ Payment failed");
        break;

      case "PENDING":
        paymentStatus = "pending";
        orderStatus = "pending";
        console.log("⏳ Payment pending");
        break;

      default:
        console.log(`⚠️ Unknown payment status: ${orderDetails.order_status}`);
        paymentStatus = "pending";
        orderStatus = "pending";
    }

    // ============================================
    // STEP 5: UPDATE PAYMENT RECORD
    // ============================================
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: paymentDetails?.cf_payment_id || cashfreeOrderId,
        payment_status: paymentStatus,
        payment_response: {
          ...payment.payment_response,
          webhook_data: req.body,
          payment_method: paymentDetails?.payment_method,
          payment_time: paymentDetails?.payment_time,
        },
      })
      .eq("id", payment.id);

    if (updatePaymentError) {
      console.error("❌ Failed to update payment:", updatePaymentError);
    } else {
      console.log("✅ Payment record updated");
    }

    // ============================================
    // STEP 6: UPDATE ORDER STATUS
    // ============================================
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({ order_status: orderStatus })
      .eq("id", orderDbId);

    if (updateOrderError) {
      console.error("❌ Failed to update order:", updateOrderError);
    } else {
      console.log("✅ Order status updated to:", orderStatus);
    }

    // ============================================
    // STEP 7: LOG WEBHOOK EVENT
    // ============================================
    await supabase.from("payment_logs").insert({
      payment_id: payment.id,
      event_type: `webhook_${type}`,
      event_data: {
        cashfree_order_id: cashfreeOrderId,
        order_status: orderDetails.order_status,
        payment_status: paymentStatus,
        webhook_type: type,
        payment_details: paymentDetails,
      },
    });

    // ============================================
    // STEP 8: HANDLE SUCCESSFUL PAYMENT - DEDUCT STOCK & SEND EMAILS
    // ============================================
    if (orderStatus === "confirmed") {
      console.log("🎉 Processing successful payment");

      // Get order items for stock deduction
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderDbId);

      // Deduct stock for each item
      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          await supabase.rpc("decrement_stock", {
            p_product_id: item.product_id,
            p_size: item.size,
            p_quantity: item.quantity,
          });
        }
        console.log("✅ Stock deducted for all items");
      }

      // Send confirmation emails
      const emailOrderData = {
        orderId: orderData.order_id,
        customerName: orderData.customer_name,
        customerEmail: orderData.customer_email,
        customerPhone: orderData.customer_phone,
        shippingAddress: orderData.shipping_address,
        shippingCity: orderData.shipping_city,
        shippingState: orderData.shipping_state,
        shippingPostalCode: orderData.shipping_postal_code,
        items: (orderItems || []).map((item) => ({
          name: item.product_name,
          image: item.product_image,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        subtotal: orderData.subtotal,
        taxAmount: orderData.tax_amount,
        shippingAmount: orderData.shipping_amount,
        totalAmount: orderData.total_amount,
        paymentMethod: "online",
        estimatedDelivery: orderData.estimated_delivery,
        orderDate: orderData.created_at,
      };

      // Send emails and WhatsApp notification (don't await)
      sendOrderEmails(emailOrderData).catch((err) =>
        console.error("Email sending failed:", err)
      );

      sendWhatsAppOrderNotification(emailOrderData).catch((err) =>
        console.error("WhatsApp notification failed:", err)
      );

      console.log("✅ Email and WhatsApp notifications triggered");
    }

    // ============================================
    // STEP 9: RETURN SUCCESS RESPONSE
    // ============================================
    console.log("✅ Webhook processed successfully");
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Cashfree webhook error:", error);
    // Still return 200 to prevent webhook retries
    return res.status(200).json({ received: true, error: error.message });
  }
};

/**
 * Get Payment Status
 * @route GET /api/payments/cashfree/status/:orderId
 * @desc Check payment status for an order
 */
const getCashfreePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*, orders!inner(*)")
      .eq("razorpay_order_id", orderId)
      .single();

    if (error || !payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        payment_status: payment.payment_status,
        order_status: payment.orders.order_status,
        order_id: payment.orders.order_id,
      },
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payment status",
      error: error.message,
    });
  }
};

module.exports = {
  createCashfreeOrder,
  cashfreeWebhook,
  getCashfreePaymentStatus,
};
