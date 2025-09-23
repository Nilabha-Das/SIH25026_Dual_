const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { sendOTPEmail, verifyOTP } = require("../services/otpService");
const User = require("../models/User");

// @route   POST /send-otp
// @desc    Send OTP to user's email for verification
// @access  Public (requires token from OAuth)
router.post('/send-otp', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify the token to get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send OTP to user's email
    const result = await sendOTPEmail(user.email, user.name);
    
    if (result.success) {
      res.json({ 
        message: result.message,
        email: user.email.replace(/(.{2})(.+)(@.+)/, '$1***$3') // Mask email for privacy
      });
    } else {
      res.status(500).json({ message: result.message });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
});

// @route   POST /verify-otp
// @desc    Verify OTP and complete authentication
// @access  Public (requires token from OAuth)
router.post('/verify-otp', async (req, res) => {
  try {
    const { token, otp } = req.body;
    
    if (!token || !otp) {
      return res.status(400).json({ message: 'Token and OTP are required' });
    }

    // Verify the token to get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP
    const verificationResult = verifyOTP(user.email, otp);
    
    if (verificationResult.success) {
      // Mark user as verified and generate new token
      user.isEmailVerified = true;
      await user.save();

      // Generate new token for the verified user
      const newToken = jwt.sign(
        { 
          id: user._id, 
          role: user.role,
          otpVerified: true
        }, 
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: 'OTP verified successfully! Welcome to AYUSH EMR.',
        token: newToken,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          abhaId: user.abhaId,
          profilePicture: user.profilePicture,
          oauthProvider: user.oauthProvider,
          hasCompletedRoleSelection: user.hasCompletedRoleSelection,
          isEmailVerified: user.isEmailVerified
        }
      });

    } else {
      res.status(400).json({ message: verificationResult.message });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
});

// @route   POST /resend-otp
// @desc    Resend OTP to user's email
// @access  Public (requires token from OAuth)
router.post('/resend-otp', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify the token to get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send new OTP
    const result = await sendOTPEmail(user.email, user.name);
    
    if (result.success) {
      res.json({ 
        message: 'New OTP sent successfully!',
        email: user.email.replace(/(.{2})(.+)(@.+)/, '$1***$3') // Mask email for privacy
      });
    } else {
      res.status(500).json({ message: result.message });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

module.exports = router;