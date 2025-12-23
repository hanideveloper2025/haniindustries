const express = require("express");
const { supabase } = require("../config/supabaseClient");

const router = express.Router();

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;// SAME token as Meta

// ======================================================
// 1️⃣ Webhook Verification (Meta calls this once)
// ======================================================
router.get("/webhook/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ WhatsApp webhook verified");
        return res.status(200).send(challenge);
    }

    console.log("❌ WhatsApp webhook verification failed");
    return res.sendStatus(403);
});

// ======================================================
// 2️⃣ Webhook Event Listener (messages + statuses)
// ======================================================
router.post("/webhook/whatsapp", async (req, res) => {
    try {
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        // --------------------------------------------------
        // 📩 USER SENT A MESSAGE (START / REFRESH 24H WINDOW)
        // --------------------------------------------------
        if (value?.messages) {
            const message = value.messages[0];
            const from = message.from; // phone number
            const timestamp = new Date(Number(message.timestamp) * 1000);

            console.log("📩 Incoming WhatsApp message");
            console.log("From:", from);
            console.log("Text:", message.text?.body);
            console.log("Time:", timestamp.toISOString());

            // 🔴 SAVE / UPDATE LAST USER MESSAGE TIME IN SUPABASE
            const { error } = await supabase
            .from("whatsapp_sessions")
            .upsert({
                phone: from,
                last_user_message_time: timestamp,
            });

            if (error) {
                console.error("❌ Failed to save WhatsApp session:", error);
            } else {
                console.log("✅ WhatsApp session timestamp saved");
            }
        }

        // --------------------------------------------------
        // 📦 MESSAGE DELIVERY STATUS (sent / delivered / read)
        // --------------------------------------------------
        if (value?.statuses) {
            const status = value.statuses[0];

            console.log("📦 WhatsApp status update");
            console.log("Message ID:", status.id);
            console.log("Status:", status.status);
        }

        return res.sendStatus(200);
    } catch (err) {
        console.error("❌ WhatsApp webhook error:", err);
        return res.sendStatus(500);
    }
});

module.exports = router;
