const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const passport = require("passport");
const path = require("path");

const imageRoutes = require("./routes/imageRoutes");
const customizationRoutes = require("./routes/customizationRoutes");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payment");

// Create express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Passport initialization
app.use(passport.initialize());
require("./config/passport");

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/images", imageRoutes);
app.use("/customizations", customizationRoutes);
app.use("/api", cartRoutes);
app.use("/api/payment", paymentRoutes);

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// 🔥 ===== SERVE REACT BUILD (Production) =====
// Only serve static files if build directory exists
const buildPath = path.join(__dirname, "build");
const fs = require("fs");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // Serve React app for all non-API routes
  app.get("*", (req, res) => {
    // Don't serve HTML for API routes
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/images") ||
      req.path.startsWith("/customizations")
    ) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// IMPORTANT for EC2
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
