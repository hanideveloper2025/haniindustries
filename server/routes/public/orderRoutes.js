const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  paymentFailed,
  getOrderDetails,
} = require("../../controllers/public/orderControllers");

// Create order (COD or Cashfree)
router.post("/create", createOrder);

// Verify Cashfree payment
router.post("/verify", verifyPayment);

// Handle payment failure
router.post("/failed", paymentFailed);

// Get order details
router.get("/:orderId", getOrderDetails);

module.exports = router;
