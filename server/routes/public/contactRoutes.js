const express = require("express");
const router = express.Router();
const {
  submitContactForm,
} = require("../../controllers/public/contactController");

// POST /api/contact - Submit contact form
router.post("/", submitContactForm);

module.exports = router;
