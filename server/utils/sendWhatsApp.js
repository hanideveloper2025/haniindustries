const axios = require("axios");

// Send WhatsApp OTP (existing function)
async function sendWhatsAppOTP(number, otp) {
  await axios.post(
    `https://graph.facebook.com/v20.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: number,
      type: "template",
      template: {
        name: process.env.META_TEMPLATE_NAME,
        language: { code: "en_US" },
        components: [
          { type: "body", parameters: [{ type: "text", text: otp }] },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// Format currency for WhatsApp message
const formatCurrency = (amountInPaise) => {
  return `₹${(amountInPaise / 100).toFixed(2)}`;
};

// Format date for WhatsApp message
const formatDate = (dateString) => {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

// Send WhatsApp Order Notification to Admin
async function sendWhatsAppOrderNotification(orderData) {
  try {
    const {
      orderId,
      customerName,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPostalCode,
      items,
      totalAmount,
      paymentMethod,
      orderDate,
    } = orderData;

    // Build items list
    const itemsList = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.size}) x${
            item.quantity
          } - ${formatCurrency(item.totalPrice)}`
      )
      .join("\n");

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const paymentLabel =
      paymentMethod === "cod" ? "💵 Cash on Delivery" : "✅ Paid Online";

    // Professional WhatsApp Message Template
    const message = `🔔 *NEW ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━━━━

📋 *Order ID:* ${orderId}
📅 *Order Date:* ${formatDate(orderDate)}

━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━
*Name:* ${customerName}
*Phone:* ${customerPhone}

━━━━━━━━━━━━━━━━━━━━━
📍 *DELIVERY ADDRESS*
━━━━━━━━━━━━━━━━━━━━━
${shippingAddress}
${shippingCity}, ${shippingState}
PIN: ${shippingPostalCode}

━━━━━━━━━━━━━━━━━━━━━
🛒 *ORDER ITEMS (${totalItems})*
━━━━━━━━━━━━━━━━━━━━━
${itemsList}

━━━━━━━━━━━━━━━━━━━━━
💰 *PAYMENT DETAILS*
━━━━━━━━━━━━━━━━━━━━━
*Method:* ${paymentLabel}
*Total Amount:* *${formatCurrency(totalAmount)}*

━━━━━━━━━━━━━━━━━━━━━
${
  paymentMethod === "cod"
    ? "⚠️ *Collect payment on delivery*"
    : "✅ *Payment already received*"
}

🏭 *Hani Industries*`;

    // Send WhatsApp message using Meta API
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: process.env.ADMIN_WHATSAPP_NUMBER,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp notification sent to admin:", response.data);
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
    };
  } catch (error) {
    console.error(
      "❌ WhatsApp notification error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

module.exports = {
  sendWhatsAppOTP,
  sendWhatsAppOrderNotification,
};
