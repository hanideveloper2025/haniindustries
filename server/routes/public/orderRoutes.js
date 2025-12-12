const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  paymentFailed,
  getOrderDetails,
  razorpayWebhook,
} = require("../../controllers/public/orderControllers");

// Create order (COD or Razorpay)
router.post("/create", createOrder);

// Verify Razorpay payment
router.post("/verify", verifyPayment);

// Handle payment failure
router.post("/failed", paymentFailed);

// Get order details
router.get("/:orderId", getOrderDetails);

// Razorpay webhook (for server-to-server communication)
router.post("/webhook", razorpayWebhook);

module.exports = router;
