const { supabase } = require("../../config/supabaseClient");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sendOrderEmails } = require("../../utils/emailService");
const { sendWhatsAppOrderNotification } = require("../../utils/sendWhatsApp");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Generate unique order ID
const generateOrderId = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("order_id")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return "ORD001";
  }

  const lastOrderId = data[0].order_id;
  const lastNumber = parseInt(lastOrderId.replace("ORD", ""));
  const nextNumber = lastNumber + 1;
  return `ORD${nextNumber.toString().padStart(3, "0")}`;
};

// Create Order (COD or Razorpay)
const createOrder = async (req, res) => {
  try {
    const {
      customerDetails,
      shippingDetails,
      cartItems,
      paymentMethod,
      amounts,
    } = req.body;

    // Validate required fields
    if (
      !customerDetails ||
      !shippingDetails ||
      !cartItems ||
      !paymentMethod ||
      !amounts
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ============================================
    // STEP 1: VALIDATE STOCK BEFORE CREATING ORDER
    // ============================================
    const stockErrors = [];

    for (const item of cartItems) {
      // Get product variant stock from database
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("product_id", item.productId)
        .eq("size", item.size)
        .single();

      if (variantError || !variant) {
        stockErrors.push({
          itemName: item.name,
          itemSize: item.size,
          requestedQty: item.quantity,
          availableStock: 0,
          isOutOfStock: true,
          message: "Product variant not found",
        });
        continue;
      }

      const availableStock = variant.stock || 0;

      if (item.quantity > availableStock) {
        stockErrors.push({
          itemName: item.name,
          itemSize: item.size,
          requestedQty: item.quantity,
          availableStock: availableStock,
          isOutOfStock: availableStock === 0,
        });
      }
    }

    // If stock errors found, return error response
    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Stock validation failed",
        stockErrors: stockErrors,
      });
    }

    // ============================================
    // STEP 2: GENERATE ORDER ID
    // ============================================
    const orderId = await generateOrderId();

    // Calculate estimated delivery (5-7 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(
      estimatedDelivery.getDate() + 5 + Math.floor(Math.random() * 3)
    );

    // ============================================
    // STEP 3: CREATE OR GET CUSTOMER (Prevent Duplicates)
    // ============================================
    // Logic: If ALL fields match (case-insensitive), use existing customer
    // If even ONE field is different, create new customer
    let customerId = null;

    // Normalize current customer data to lowercase for comparison
    const normalizedFirstName = customerDetails.firstName.trim().toLowerCase();
    const normalizedLastName = customerDetails.lastName.trim().toLowerCase();
    const normalizedEmail = customerDetails.email.trim().toLowerCase();
    const normalizedPhone = customerDetails.phone.trim();

    // Get all customers and check for exact match (case-insensitive)
    const { data: allCustomers, error: fetchError } = await supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone");

    if (fetchError) {
      console.error("Error fetching customers:", fetchError);
    }

    // Find exact match where ALL fields are same (case-insensitive)
    let exactMatchCustomer = null;
    if (allCustomers && allCustomers.length > 0) {
      exactMatchCustomer = allCustomers.find((customer) => {
        const dbFirstName = (customer.first_name || "").trim().toLowerCase();
        const dbLastName = (customer.last_name || "").trim().toLowerCase();
        const dbEmail = (customer.email || "").trim().toLowerCase();
        const dbPhone = (customer.phone || "").trim();

        return (
          dbFirstName === normalizedFirstName &&
          dbLastName === normalizedLastName &&
          dbEmail === normalizedEmail &&
          dbPhone === normalizedPhone
        );
      });
    }

    if (exactMatchCustomer) {
      // All fields match - use existing customer (no duplicate)
      customerId = exactMatchCustomer.id;
      console.log("Using existing customer:", customerId);
    } else {
      // At least one field is different - create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          first_name: customerDetails.firstName.trim(),
          last_name: customerDetails.lastName.trim(),
          email: customerDetails.email.trim().toLowerCase(),
          phone: customerDetails.phone.trim(),
        })
        .select("id")
        .single();

      if (customerError) {
        console.error("Customer creation error:", customerError);
        return res.status(500).json({
          success: false,
          message: "Failed to create customer",
          error: customerError.message,
        });
      }
      customerId = newCustomer.id;
      console.log("Created new customer:", customerId);
    }

    // ============================================
    // STEP 4: SAVE CUSTOMER ADDRESS
    // ============================================
    if (customerId) {
      const { error: addressError } = await supabase
        .from("customer_addresses")
        .insert({
          customer_id: customerId,
          address_line: shippingDetails.address.trim(),
          city: shippingDetails.city.trim(),
          state: shippingDetails.state.trim(),
          postal_code: shippingDetails.postalCode.trim(),
          is_default: true,
        });

      if (addressError) {
        console.error("Address creation error:", addressError);
      }
    }

    // ============================================
    // STEP 5: CREATE ORDER IN DATABASE
    // ============================================
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_id: orderId,
        customer_id: customerId,
        customer_name: `${customerDetails.firstName} ${customerDetails.lastName}`,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        shipping_address: shippingDetails.address,
        shipping_city: shippingDetails.city,
        shipping_state: shippingDetails.state,
        shipping_postal_code: shippingDetails.postalCode,
        subtotal: amounts.subtotal, // Already in paise from frontend
        tax_amount: amounts.tax,
        shipping_amount: amounts.shipping,
        total_amount: amounts.total,
        order_status: "pending",
        estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: orderError.message,
      });
    }

    // Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      size: item.size,
      quantity: item.quantity,
      unit_price: Math.round(item.price * 100), // Convert to paise
      total_price: Math.round(item.price * item.quantity * 100), // Convert to paise
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      return res.status(500).json({
        success: false,
        message: "Failed to create order items",
      });
    }

    // Handle payment based on method
    if (paymentMethod === "cod") {
      // Create payment record for COD
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: order.id,
          payment_method: "cod",
          amount: amounts.total,
          currency: "INR",
          payment_status: "pending",
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Payment record error:", paymentError);
      }

      // Update order status to confirmed for COD
      await supabase
        .from("orders")
        .update({ order_status: "confirmed" })
        .eq("id", order.id);

      // Deduct stock for each item
      for (const item of cartItems) {
        await supabase.rpc("decrement_stock", {
          p_product_id: item.productId,
          p_size: item.size,
          p_quantity: item.quantity,
        });
      }

      // ============================================
      // SEND ORDER CONFIRMATION EMAILS (COD)
      // ============================================
      const emailOrderData = {
        orderId: orderId,
        customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        shippingAddress: shippingDetails.address,
        shippingCity: shippingDetails.city,
        shippingState: shippingDetails.state,
        shippingPostalCode: shippingDetails.postalCode,
        items: orderItems.map((item) => ({
          name: item.product_name,
          image: item.product_image,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        subtotal: amounts.subtotal,
        taxAmount: amounts.tax,
        shippingAmount: amounts.shipping,
        totalAmount: amounts.total,
        paymentMethod: "cod",
        estimatedDelivery: estimatedDelivery.toISOString().split("T")[0],
        orderDate: new Date().toISOString(),
      };

      // Send emails (don't await - let it run in background)
      sendOrderEmails(emailOrderData).catch((err) =>
        console.error("Email sending failed:", err)
      );

      // Send WhatsApp notification to admin (don't await - let it run in background)
      sendWhatsAppOrderNotification(emailOrderData).catch((err) =>
        console.error("WhatsApp notification failed:", err)
      );

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: orderId,
          orderDbId: order.id,
          paymentMethod: "cod",
          estimatedDelivery: estimatedDelivery.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      });
    } else {
      // Create Razorpay order for online payment
      const razorpayOrder = await razorpay.orders.create({
        amount: amounts.total, // Amount in paise
        currency: "INR",
        receipt: orderId,
        notes: {
          order_id: orderId,
          customer_email: customerDetails.email,
        },
      });

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: order.id,
          payment_method: "razorpay",
          razorpay_order_id: razorpayOrder.id,
          amount: amounts.total,
          currency: "INR",
          payment_status: "pending",
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Payment record error:", paymentError);
      }

      // Log payment initiation
      await supabase.from("payment_logs").insert({
        payment_id: payment?.id,
        event_type: "order_created",
        event_data: {
          razorpay_order_id: razorpayOrder.id,
          amount: amounts.total,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Razorpay order created",
        data: {
          orderId: orderId,
          orderDbId: order.id,
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: amounts.total,
          currency: "INR",
          customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          estimatedDelivery: estimatedDelivery.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      });
    }
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Verify Razorpay Payment
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDbId,
      cartItems,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Update payment status to failed
      await supabase
        .from("payments")
        .update({
          payment_status: "failed",
          payment_response: { error: "Signature verification failed" },
        })
        .eq("razorpay_order_id", razorpay_order_id);

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        payment_status: "captured",
        payment_response: paymentDetails,
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .single();

    if (paymentError) {
      console.error("Payment update error:", paymentError);
    }

    // Update order status
    await supabase
      .from("orders")
      .update({ order_status: "confirmed" })
      .eq("id", orderDbId);

    // Log successful payment
    await supabase.from("payment_logs").insert({
      payment_id: payment?.id,
      event_type: "payment_success",
      event_data: {
        razorpay_payment_id,
        razorpay_order_id,
        method: paymentDetails.method,
      },
    });

    // Deduct stock for each item
    if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        await supabase.rpc("decrement_stock", {
          p_product_id: item.productId,
          p_size: item.size,
          p_quantity: item.quantity,
        });
      }
    }

    // Get order details
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderDbId)
      .single();

    // Get order items for email
    const { data: orderItemsData } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderDbId);

    // ============================================
    // SEND ORDER CONFIRMATION EMAILS (ONLINE PAYMENT)
    // ============================================
    if (order) {
      const emailOrderData = {
        orderId: order.order_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingState: order.shipping_state,
        shippingPostalCode: order.shipping_postal_code,
        items: (orderItemsData || []).map((item) => ({
          name: item.product_name,
          image: item.product_image,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        shippingAmount: order.shipping_amount,
        totalAmount: order.total_amount,
        paymentMethod: "razorpay",
        estimatedDelivery: order.estimated_delivery,
        orderDate: order.created_at,
      };

      // Send emails (don't await - let it run in background)
      sendOrderEmails(emailOrderData).catch((err) =>
        console.error("Email sending failed:", err)
      );

      // Send WhatsApp notification to admin (don't await - let it run in background)
      sendWhatsAppOrderNotification(emailOrderData).catch((err) =>
        console.error("WhatsApp notification failed:", err)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: order?.order_id,
        paymentId: razorpay_payment_id,
        estimatedDelivery: order?.estimated_delivery,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification error",
      error: error.message,
    });
  }
};

// Payment Failed Handler
const paymentFailed = async (req, res) => {
  try {
    const { razorpay_order_id, error_description, orderDbId } = req.body;

    // Update payment status
    await supabase
      .from("payments")
      .update({
        payment_status: "failed",
        payment_response: { error: error_description },
      })
      .eq("razorpay_order_id", razorpay_order_id);

    // Update order status
    await supabase
      .from("orders")
      .update({ order_status: "payment_failed" })
      .eq("id", orderDbId);

    // Log failed payment
    const { data: payment } = await supabase
      .from("payments")
      .select("id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (payment) {
      await supabase.from("payment_logs").insert({
        payment_id: payment.id,
        event_type: "payment_failed",
        event_data: { error: error_description },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment failure recorded",
    });
  } catch (error) {
    console.error("Payment failed handler error:", error);
    return res.status(500).json({
      success: false,
      message: "Error recording payment failure",
    });
  }
};

// Get Order Details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        payments (*)
      `
      )
      .eq("order_id", orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching order",
    });
  }
};

// Razorpay Webhook Handler
const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Handle different webhook events
    switch (event) {
      case "payment.captured":
        await supabase
          .from("payments")
          .update({
            payment_status: "captured",
            razorpay_payment_id: payload.payment.entity.id,
          })
          .eq("razorpay_order_id", payload.payment.entity.order_id);
        break;

      case "payment.failed":
        await supabase
          .from("payments")
          .update({
            payment_status: "failed",
            payment_response: payload.payment.entity,
          })
          .eq("razorpay_order_id", payload.payment.entity.order_id);
        break;

      case "refund.created":
        await supabase
          .from("payments")
          .update({
            refund_id: payload.refund.entity.id,
            refund_amount: payload.refund.entity.amount,
            refund_status: "processing",
          })
          .eq("razorpay_payment_id", payload.refund.entity.payment_id);
        break;
    }

    // Log webhook event
    await supabase.from("payment_logs").insert({
      event_type: `webhook_${event}`,
      event_data: payload,
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ message: "Webhook error" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  paymentFailed,
  getOrderDetails,
  razorpayWebhook,
};
