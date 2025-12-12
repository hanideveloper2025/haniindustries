const express = require("express");
const router = express.Router();

// Import controllers
const {
  getFeaturedProducts,
  getCategories,
  getProductDetails,
  getAllActiveProducts,
  getRelatedProducts,
  searchProducts,
} = require("../../controllers/public/homeControllers");

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   GET /api/home/search
 * @desc    Search products by name, category, or description
 * @access  Public
 * @query   q (required) - Search query string
 * @query   limit (optional, default: 10) - Max number of results
 */
router.get("/search", searchProducts);

/**
 * @route   GET /api/home/featured-products
 * @desc    Get featured products for homepage
 * @access  Public
 * @query   category (optional) - Filter by category (e.g., "oil", "cleaners", "all")
 * @query   limit (optional) - Limit number of products returned
 */
router.get("/featured-products", getFeaturedProducts);

/**
 * @route   GET /api/home/categories
 * @desc    Get all unique product categories
 * @access  Public
 */
router.get("/categories", getCategories);

/**
 * @route   GET /api/home/products
 * @desc    Get all active products with pagination and filtering
 * @access  Public
 * @query   category (optional) - Filter by category
 * @query   page (optional, default: 1) - Page number
 * @query   limit (optional, default: 12) - Items per page
 * @query   sortBy (optional, default: "created_at") - Sort field
 * @query   sortOrder (optional, default: "desc") - Sort direction (asc/desc)
 * @query   minPrice (optional) - Minimum price filter
 * @query   maxPrice (optional) - Maximum price filter
 */
router.get("/products", getAllActiveProducts);

/**
 * @route   GET /api/home/product/:id
 * @desc    Get single product details by product_id (e.g., "HANI0001")
 * @access  Public
 */
router.get("/product/:id", getProductDetails);

/**
 * @route   GET /api/home/related-products/:id
 * @desc    Get related products based on category
 * @access  Public
 * @query   limit (optional, default: 4) - Number of related products to return
 */
router.get("/related-products/:id", getRelatedProducts);

module.exports = router;
