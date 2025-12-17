const { supabase } = require("../../config/supabaseClient");
const crypto = require("crypto");

// ENV
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL;
const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

// Generate unique Cashfree order ID
const generateCashfreeOrderId = () =>
  `CF_ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * CREATE CASHFREE ORDER
 * POST /api/payments/cashfree/create-order
 */
const createCashfreeOrder = async (req, res) => {
  try {
    const { orderDbId, amount, customerDetails } = req.body;

    if (!orderDbId || !amount || !customerDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY || !CASHFREE_BASE_URL) {
      console.error("❌ Cashfree credentials are not configured properly");
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error",
      });
    }

    const cashfreeOrderId = generateCashfreeOrderId();

    const payload = {
      order_id: cashfreeOrderId,
      order_amount: (amount / 100).toFixed(2),
      order_currency: "INR",
      customer_details: {
        customer_id: `CUST_${orderDbId}`,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/checkout?order_id=${cashfreeOrderId}`,
      },
      order_note: "Order from Hani Industries",
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree API error:", response.status, data);
      return res.status(response.status).json({
        success: false,
        message: "Cashfree order creation failed",
        error: data,
      });
    }

    // Update payment record
    await supabase
      .from("payments")
      .update({
        razorpay_order_id: cashfreeOrderId,
        payment_response: {
          cashfree_order_id: cashfreeOrderId,
          payment_session_id: data.payment_session_id,
        },
      })
      .eq("order_id", orderDbId);

    return res.status(200).json({
      success: true,
      data: {
        payment_session_id: data.payment_session_id,
        cashfree_order_id: cashfreeOrderId,
      },
    });
  } catch (error) {
    console.error("Create Cashfree order error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * CASHFREE WEBHOOK
 * POST /api/payments/cashfree/webhook
 */
const cashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-cf-signature"];
    const rawBody = req.rawBody;

    if (!signature || !rawBody) {
      return res.status(401).json({ message: "Invalid webhook request" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", CASHFREE_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid Cashfree webhook signature");
      return res.status(401).json({ message: "Invalid signature" });
    }

    console.log("✅ Cashfree webhook verified");

    const { data } = JSON.parse(rawBody);
    const orderStatus = data.order.order_status;
    const cashfreeOrderId = data.order.order_id;

    let paymentStatus = "pending";
    let orderDbStatus = "pending";

    if (orderStatus === "PAID") {
      paymentStatus = "captured";
      orderDbStatus = "confirmed";
    } else if (orderStatus === "EXPIRED" || orderStatus === "TERMINATED") {
      paymentStatus = "failed";
      orderDbStatus = "payment_failed";
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", cashfreeOrderId)
      .single();

    if (!payment) {
      return res.status(200).json({ received: true });
    }

    await supabase
      .from("payments")
      .update({
        payment_status: paymentStatus,
        razorpay_payment_id: data.payment?.cf_payment_id,
        payment_response: {
          webhook: data,
        },
      })
      .eq("id", payment.id);

    await supabase
      .from("orders")
      .update({ order_status: orderDbStatus })
      .eq("id", payment.order_id);

    console.log("✅ Cashfree webhook processed:", cashfreeOrderId);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    return res.status(200).json({ received: true });
  }
};

/**
 * GET PAYMENT STATUS
 */
const getCashfreePaymentStatus = async (req, res) => {
  const { orderId } = req.params;

  const { data } = await supabase
    .from("payments")
    .select("payment_status, orders(order_status)")
    .eq("razorpay_order_id", orderId)
    .single();

  if (!data) {
    return res.status(404).json({ success: false });
  }

  return res.status(200).json({
    success: true,
    payment_status: data.payment_status,
    order_status: data.orders.order_status,
  });
};

module.exports = {
  createCashfreeOrder,
  cashfreeWebhook,
  getCashfreePaymentStatus,
};
