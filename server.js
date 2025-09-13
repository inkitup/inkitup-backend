const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const passport = require("passport");
const imageRoutes = require('./routes/imageRoutes');
const customizationRoutes = require('./routes/customizationRoutes');
const cartRoutes = require('./routes/cart');


// Create express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Passport initialization (must be before routes)
app.use(passport.initialize());

require("./config/passport");

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use('/images', imageRoutes);
app.use('/customizations', customizationRoutes);
app.use('/api', cartRoutes); 

// Simple test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
