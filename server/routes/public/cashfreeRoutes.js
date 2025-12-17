const express = require("express");
const router = express.Router();
const {
  createCashfreeOrder,
  cashfreeWebhook,
  getCashfreePaymentStatus,
} = require("../../controllers/public/cashfreeControllers");

// Create Cashfree payment order
router.post("/create-order", createCashfreeOrder);

// Cashfree webhook (for server-to-server communication)
router.post("/webhook", cashfreeWebhook);

// Get payment status
router.get("/status/:orderId", getCashfreePaymentStatus);

module.exports = router;
