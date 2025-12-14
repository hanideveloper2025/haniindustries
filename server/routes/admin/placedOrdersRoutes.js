const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../utils/authController");
const {
  getPlacedOrders,
  markOrderCompleted,
  cancelOrder,
  sendDispatchNotification,
} = require("../../controllers/admin/placedOrdersControllers");

// Protect all routes with admin authentication
router.use(adminAuth);

// @route   GET /api/admin/placed-orders
// @desc    Get all placed orders with optional status filter
// @access  Private (Admin only)
router.get("/", getPlacedOrders);

// @route   PUT /api/admin/placed-orders/:orderId/complete
// @desc    Mark order as completed
// @access  Private (Admin only)
router.put("/:orderId/complete", markOrderCompleted);

// @route   PUT /api/admin/placed-orders/:orderId/cancel
// @desc    Cancel order
// @access  Private (Admin only)
router.put("/:orderId/cancel", cancelOrder);

// @route   POST /api/admin/placed-orders/:orderId/dispatch
// @desc    Send dispatch notification email
// @access  Private (Admin only)
router.post("/:orderId/dispatch", sendDispatchNotification);

module.exports = router;
