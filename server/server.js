const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const { supabase, testSupabaseConnection } = require("./config/supabaseClient");
// Replace your current CORS middleware with:
const allowedOrigins = ["http://localhost:5173", "https://hani-industries.in"];
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS request from:", origin);
      if (!origin) return callback(null, true); // allow non-browser requests (like Postman)

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // allow
      } else {
        callback(null, false); // deny without throwing error
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT;

// Routes
app.get("/", (req, res) => {
  res.send("Hello From Hani Industries Server");
});

//Admin Routes
app.use("/api/admin", require("./routes/admin/loginRoutes"));
app.use("/api/admin/products", require("./routes/admin/productRoutes"));
app.use(
  "/api/admin/featured-products",
  require("./routes/admin/featuredProductRoutes")
);

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
