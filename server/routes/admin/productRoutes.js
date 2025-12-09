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
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  generateProductId,
  uploadSingleImage,
  deleteVariant,
} = require("../../controllers/admin/productControllers");

// Auth middleware (optional - uncomment if you want to protect routes)
// const { verifyAdmin } = require("../../utils/authController");

// Routes

// Upload single image to Cloudinary (immediate upload on file select)
router.post("/upload-image", upload.single("image"), uploadSingleImage);

// Generate Product ID
router.get("/generate-id", generateProductId);

// Get all products
router.get("/", getAllProducts);

// Get single product
router.get("/:id", getProductById);

// Create product (images are pre-uploaded, receives URLs in sizes array)
router.post("/", express.json(), createProduct);

// Update product (images are pre-uploaded, receives URLs in sizes array)
router.put("/:id", express.json(), updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

// Delete single variant from a product
router.delete("/:productId/variant/:variantId", deleteVariant);

module.exports = router;
