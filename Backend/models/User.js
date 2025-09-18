const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["doctor", "patient", "curator", "admin"], default: "patient" },
  abhaId: { type: String, unique: true },
  medicalRecords: [{
    date: { type: Date, default: Date.now },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    namasteCode: String,
    namasteTerm: String,
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
