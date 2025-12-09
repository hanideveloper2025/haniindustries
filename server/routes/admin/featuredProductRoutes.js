const express = require("express");
const router = express.Router();
const multer = require("multer");

// Multer configuration for memory storage (to upload to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Import controllers
const {
  uploadFeaturedImage,
  createFeaturedProduct,
  getAllFeaturedProducts,
  getActiveFeaturedProducts,
  getFeaturedProductById,
  updateFeaturedProduct,
  deleteFeaturedProduct,
  toggleFeaturedProductStatus,
} = require("../../controllers/admin/featuredProductControllers");

// Auth middleware (optional - uncomment if you want to protect routes)
// const { verifyAdmin } = require("../../utils/authController");

// Routes

// Upload single image to Cloudinary (immediate upload on file select)
router.post("/upload-image", upload.single("image"), uploadFeaturedImage);

// Get all featured products (admin)
router.get("/", getAllFeaturedProducts);

// Get active featured products (public/homepage)
router.get("/active", getActiveFeaturedProducts);

// Get single featured product
router.get("/:id", getFeaturedProductById);

// Create new featured product
router.post("/", createFeaturedProduct);

// Update featured product
router.put("/:id", updateFeaturedProduct);

// Toggle active status
router.patch("/:id/toggle-status", toggleFeaturedProductStatus);

// Delete featured product
router.delete("/:id", deleteFeaturedProduct);

module.exports = router;
