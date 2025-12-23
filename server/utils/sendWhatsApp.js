const axios = require("axios");
const { supabase } = require("../config/supabaseClient");

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`;
const ADMIN_PHONE = process.env.DUMMY_WHATSAPP_NUMBER;

/* ----------------------------------------------------
 *   Utility: 24-hour session check
 * ---------------------------------------------------- */
const isWithin24Hours = (lastTime) => {
  if (!lastTime) return false;
  return Date.now() - new Date(lastTime).getTime() < 24 * 60 * 60 * 1000;
};

/* ----------------------------------------------------
 *   1️⃣ SESSION MESSAGE (TEXT)
 * ---------------------------------------------------- */
const sendTextMessage = async (order) => {
  console.log("========== WHATSAPP TEXT DEBUG START ==========");
  console.log("WHATSAPP API URL:", WHATSAPP_API_URL);
  console.log("TO:", ADMIN_PHONE);
  console.log("ORDER DATA:", order);

  const payload = {
    messaging_product: "whatsapp",
    to: ADMIN_PHONE,
    type: "text",
    text: {
      body:
      `🆕 New Order Received!

      🆔 Order ID: ${order.orderId}
      💳 Payment Method: ${order.paymentMethod}
      🔐 Transaction Ref: ${order.transactionId}

      👤 Customer:
      ${order.name}
      ${order.phone}
      ${order.email}

      📍 Address:
      ${order.address}

      🛒 Items:
      ${order.items}

      💰 Total: ₹${order.totalAmount}

      📍 Location:
      ${order.locationLink}

      Please process this order at the earliest.`
    }
  };

  console.log("TEXT PAYLOAD:", JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ TEXT MESSAGE SUCCESS:", res.data);
  } catch (err) {
    console.error("❌ TEXT MESSAGE FAILED");
    console.error("STATUS:", err.response?.status);
    console.error("RESPONSE:", err.response?.data);
    throw err;
  }

  console.log("========== WHATSAPP TEXT DEBUG END ==========");
};

/* ----------------------------------------------------
 *   2️⃣ TEMPLATE MESSAGE
 * ---------------------------------------------------- */
const sendTemplateMessage = async (order) => {
  console.log("========== WHATSAPP TEMPLATE DEBUG START ==========");
  console.log("WHATSAPP API URL:", WHATSAPP_API_URL);
  console.log("TO:", ADMIN_PHONE);
  console.log("TEMPLATE NAME: order_confirmed_admin_alert");
  console.log("LANGUAGE CODE: en");
  console.log("ORDER DATA:", order);

  const payload = {
    messaging_product: "whatsapp",
    to: ADMIN_PHONE,
    type: "template",
    template: {
      name: "order_confirmed_admin_alert",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: order.orderId },
            { type: "text", text: order.paymentMethod },
            { type: "text", text: order.transactionId },
            { type: "text", text: order.name },
            { type: "text", text: order.phone },
            { type: "text", text: order.email },
            { type: "text", text: order.address },
            { type: "text", text: order.items },
            { type: "text", text: order.totalAmount },
            { type: "text", text: order.locationLink }
          ]
        }
      ]
    }
  };

  console.log("TEMPLATE PAYLOAD:", JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ TEMPLATE MESSAGE SUCCESS:", res.data);
  } catch (err) {
    console.error("❌ TEMPLATE MESSAGE FAILED");
    console.error("STATUS:", err.response?.status);
    console.error("RESPONSE:", err.response?.data);
    console.error("FB TRACE ID:", err.response?.headers?.["x-fb-trace-id"]);
    throw err;
  }

  console.log("========== WHATSAPP TEMPLATE DEBUG END ==========");
};

/* ----------------------------------------------------
 *   3️⃣ MAIN FUNCTION
 * ---------------------------------------------------- */
const sendOrderWhatsAppAlert = async (order) => {
  console.log("========== WHATSAPP MAIN DEBUG START ==========");
  console.log("ADMIN PHONE:", ADMIN_PHONE);

  const { data, error } = await supabase
  .from("whatsapp_sessions")
  .select("last_user_message_time")
  .eq("phone", ADMIN_PHONE)
  .maybeSingle();

  console.log("SUPABASE SESSION DATA:", data);

  if (error) {
    console.error("❌ Failed to fetch WhatsApp session:", error);
  }

  if (isWithin24Hours(data?.last_user_message_time)) {
    console.log("📤 DECISION: SESSION (TEXT) MESSAGE");
    await sendTextMessage(order);
  } else {
    console.log("📤 DECISION: TEMPLATE MESSAGE");
    await sendTemplateMessage(order);
  }

  console.log("========== WHATSAPP MAIN DEBUG END ==========");
};

module.exports = {
  sendOrderWhatsAppAlert,
};
