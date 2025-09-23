const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Generate ABHA ID for new users
function generateAbhaId() {
  return (
    "ABHA-" +
    Math.floor(1000 + Math.random() * 9000) +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Debug environment variables
console.log('Environment check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/google/callback"  // Match your Google OAuth config
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile:', profile);

    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ 
      oauthProvider: 'google', 
      oauthId: profile.id 
    });

    if (existingUser) {
      console.log('Existing Google user found:', existingUser.email);
      // For existing users, make sure they have completed role selection
      // This ensures they don't get stuck in role selection loop on sign-in
      if (!existingUser.hasCompletedRoleSelection && existingUser.role) {
        existingUser.hasCompletedRoleSelection = true;
        await existingUser.save();
      }
      return done(null, existingUser);
    }

    // Check if user exists with same email but different provider
    existingUser = await User.findOne({ email: profile.emails[0].value });

    if (existingUser) {
      // Don't automatically link accounts for security reasons
      // User needs to login with their original method first
      console.log('Email already registered with different provider:', profile.emails[0].value);
      const error = new Error('ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER');
      error.email = profile.emails[0].value;
      error.existingProvider = existingUser.oauthProvider;
      return done(error, null);
    }

    // Create new user
    let abhaId;
    let isUnique = false;
    while (!isUnique) {
      abhaId = generateAbhaId();
      const check = await User.findOne({ abhaId });
      if (!check) isUnique = true;
    }

    const newUser = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      oauthProvider: 'google',
      oauthId: profile.id,
      profilePicture: profile.photos[0]?.value,
      isEmailVerified: true,
      role: 'patient', // Temporary default - user will select their actual role
      hasCompletedRoleSelection: false, // User needs to select role
      abhaId: abhaId
    });

    console.log('Created new Google user:', newUser.email);
    done(null, newUser);

  } catch (error) {
    console.error('Google OAuth error:', error);
    done(error, null);
  }
}));

module.exports = passport;