const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");
const validateRole = require("../middleware/validateRole");

// ABHA ID Generator
function generateAbhaId() {
  return (
    "ABHA-" +
    Math.floor(1000 + Math.random() * 9000) +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}

// ✅ REGISTER
router.post("/register", validateRole, async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, role } = req.body;
    console.log('Extracted role:', role);

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let abhaId;
    let isUnique = false;
    while (!isUnique) {
      abhaId = generateAbhaId();
      const check = await User.findOne({ abhaId });
      if (!check) isUnique = true;
    }

    console.log('Creating new user with role:', role);
    const newUser = new User({ name, email, password: hashedPassword, role, abhaId });
    console.log('New user object:', newUser);
    await newUser.save();

    // Issue JWT
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        abhaId: newUser.abhaId,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      if (err.keyPattern?.email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (err.keyPattern?.abhaId) {
        return res.status(400).json({ message: "ABHA ID generation failed, please try again" });
      }
    }
    
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Issue JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id, // Include MongoDB _id
        name: user.name,
        email: user.email,
        role: user.role,
        abhaId: user.abhaId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
