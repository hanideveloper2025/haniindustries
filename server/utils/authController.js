const jwt = require("jsonwebtoken");
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

// Middleware to protect admin routes
exports.adminAuth = (req, res, next) => {
  console.log("Admin Cookies received:", req.cookies); // 🧠 Debug
  const token = req.cookies.adminToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};



exports.checkAuth = (req, res) => {
  try {
    const token = req.cookies.adminToken; // read cookie
    if (!token) return res.status(401).json({ success: false, message: "Not logged in" });

    jwt.verify(token, ADMIN_JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ success: false, message: "Token expired" });

      res.json({ success: true, username: decoded.username });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
