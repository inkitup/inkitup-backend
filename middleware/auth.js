// middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // No token provided - let route handler decide if auth is needed
      return next();
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return next(); // Still proceed, route handler will check
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    // Don't return error here - let route handler check if user is required
    // This allows routes to handle auth failures gracefully
    next();
  }
};

module.exports = auth;
module.exports = auth;
