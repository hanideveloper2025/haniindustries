const axios = require("axios");

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
        components: [{ type: "body", parameters: [{ type: "text", text: otp }] }],
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

module.exports = sendWhatsAppOTP;
