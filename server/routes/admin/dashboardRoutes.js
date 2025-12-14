const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../utils/authController");
const {
  getDashboardStats,
  getRecentOrders,
} = require("../../controllers/admin/dashboardControllers");

// Protect all dashboard routes with authentication
router.use(adminAuth);

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get("/stats", getDashboardStats);

// @route   GET /api/admin/dashboard/orders
// @desc    Get recent orders with filters and pagination
// @access  Private (Admin only)
router.get("/orders", getRecentOrders);

module.exports = router;
