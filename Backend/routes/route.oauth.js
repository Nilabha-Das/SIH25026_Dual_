const express = require("express");
const router = express.Router();
const passport = require("../config/passport"); // Import configured passport
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import User model for role selection

// @route   GET /test
// @desc    Test route to verify OAuth routes are working
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'OAuth routes are working!', timestamp: new Date() });
});

// @route   GET /select-role-test
// @desc    Test route to verify select-role route is accessible
// @access  Public
router.get('/select-role-test', (req, res) => {
  res.json({ message: 'Select role route is accessible!', timestamp: new Date() });
});

// @route   GET /google
// @desc    Start Google OAuth flow
// @access  Public
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// @route   GET /google/callback  
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  console.log('Google OAuth callback hit:', req.query);
  
  // Handle OAuth cancellation or errors
  if (req.query.error) {
    console.log('OAuth error/cancellation:', req.query.error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_cancelled`);
  }
  
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` 
  })(req, res, (authError) => {
    if (authError) {
      console.error('Passport authentication error:', authError);
      
      // Handle specific account conflict error
      if (authError.message === 'ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER') {
        const provider = authError.existingProvider === 'local' ? 'email/password' : authError.existingProvider;
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_exists&email=${encodeURIComponent(authError.email)}&provider=${provider}`);
      }
      
      // Handle other authentication errors
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    
    // Continue to success handler
    next();
  });
},
  async (req, res) => {
    try {
      // Generate JWT for the authenticated user
      const token = jwt.sign(
        { 
          id: req.user._id, 
          role: req.user.role 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Redirect based on whether user needs role selection
      let redirectUrl;
      
      if (!req.user.hasCompletedRoleSelection) {
        // New user - redirect to role selection
        redirectUrl = `${process.env.FRONTEND_URL}/select-role?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          hasCompletedRoleSelection: req.user.hasCompletedRoleSelection
        }))}`;
      } else {
        // Existing user - redirect to OTP verification then dashboard
        redirectUrl = `${process.env.FRONTEND_URL}/otp-verification?token=${token}&requiresRole=false`;
      }
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

// @route   GET /auth/logout
// @desc    Logout user (clear session)
// @access  Private
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// @route   GET /auth/current
// @desc    Get current authenticated user
// @access  Private  
router.get('/current', (req, res) => {
  if (req.user) {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        abhaId: req.user.abhaId,
        profilePicture: req.user.profilePicture,
        oauthProvider: req.user.oauthProvider,
        hasCompletedRoleSelection: req.user.hasCompletedRoleSelection
      }
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// @route   POST /select-role
// @desc    Allow OAuth users to select their role
// @access  Public (but requires token from OAuth callback)
router.post('/select-role', async (req, res) => {
  console.log('Select role endpoint hit!');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    const { token, role } = req.body;
    
    if (!token || !role) {
      return res.status(400).json({ message: 'Token and role are required' });
    }

    if (!['doctor', 'patient', 'curator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be doctor, patient, or curator' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role and mark role selection as complete
    user.role = role;
    user.hasCompletedRoleSelection = true;
    await user.save();

    // Generate new token with updated role
    const newToken = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: 'Role updated successfully',
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
        hasCompletedRoleSelection: user.hasCompletedRoleSelection
      }
    });

  } catch (error) {
    console.error('Role selection error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error during role selection' });
  }
});

module.exports = router;