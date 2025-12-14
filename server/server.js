const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const { supabase, testSupabaseConnection } = require("./config/supabaseClient");

// CORS configuration - add all your frontend domains here
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://hani-industries.in",
  "https://www.hani-industries.in",
  // Add your Netlify/Vercel/other deployment URLs here
  process.env.FRONTEND_URL, // Set this in your Render environment variables
].filter(Boolean); // Remove undefined values

console.log("Allowed CORS origins:", allowedOrigins);

app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS request from:", origin);
      // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // allow
      } else {
        console.log(
          "CORS blocked for origin:",
          origin,
          "- Allowed origins are:",
          allowedOrigins
        );
        // Return error so the client knows CORS was the issue
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Handle CORS errors
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS error: Origin not allowed",
      origin: req.headers.origin,
    });
  }
  next(err);
});

app.use(express.json());

const PORT = process.env.PORT;

// Routes
app.get("/", (req, res) => {
  res.send("Hello From Hani Industries Server");
});

// Public Routes (Homepage, Products)
app.use("/api/home", require("./routes/public/homeRoutes"));

// Order Routes (Razorpay Integration)
app.use("/api/orders", require("./routes/public/orderRoutes"));

// Contact Routes
app.use("/api/contact", require("./routes/public/contactRoutes"));

// Admin Routes
app.use("/api/admin", require("./routes/admin/loginRoutes"));
app.use("/api/admin/products", require("./routes/admin/productRoutes"));
app.use("/api/admin/dashboard", require("./routes/admin/dashboardRoutes"));
app.use(
  "/api/admin/placed-orders",
  require("./routes/admin/placedOrdersRoutes")
);

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
