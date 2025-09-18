const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Expect: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "You do not have permission to perform this action" 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
