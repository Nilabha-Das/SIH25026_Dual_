const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return this.oauthProvider === 'local'; } }, // Only required for local auth
  role: { type: String, enum: ["doctor", "patient", "curator", "admin"], default: "patient" },
  abhaId: { type: String, unique: true },
  
  // OAuth fields
  oauthProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  oauthId: { type: String }, // Provider's user ID
  profilePicture: { type: String }, // From OAuth provider
  isEmailVerified: { type: Boolean, default: false },
  
  // Role selection tracking
  hasCompletedRoleSelection: { type: Boolean, default: function() { return this.oauthProvider === 'local'; } }, // Local users complete role during registration
  medicalRecords: [{
    date: { type: Date, default: Date.now },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    namasteCode: String,
    namasteTerm: String,
    tm2Code: String,
    tm2Title: String,
    icdCode: String,
    icdTerm: String,
    prescription: String,
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    curatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    curatorNotes: String,
    submittedAt: { type: Date, default: Date.now },
    approvedAt: Date
  }]
});

module.exports = mongoose.model("User", userSchema);
