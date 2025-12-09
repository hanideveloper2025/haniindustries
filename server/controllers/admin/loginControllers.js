const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();


const ADMIN_JWT = process.env.ADMIN_JWT_SECRET ;
// Admin Login
exports.Login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: "admin" }, ADMIN_JWT, { expiresIn: "172800m" });

  res.cookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        path: "/",
        maxAge: 172800 * 60 * 1000,
      });


      return res.json({
        success: true,
        message: "Admin Login successful",
        expiresIn: 172800 * 60, // 4months*seconds
      });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  };



// Logout controller
exports.Logout = async (req, res) => {
  res.clearCookie("adminToken", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ✅ true only in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.json({ success: true, message: "Admin Logged out successfully" });
};

;
