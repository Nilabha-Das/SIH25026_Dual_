// models/Mapping.js - Three Layer Architecture: NAMASTE → TM2 → ICD-11
const mongoose = require('mongoose');

const MappingSchema = new mongoose.Schema({
  // Layer 1: NAMASTE (Traditional Medicine Input)
  namasteCode: { type: String, required: true },
  namasteDisplay: { type: String, required: true },
  
  // Layer 2: TM2 (Traditional Medicine Module 2 - Bridge)
  tm2Code: { type: String, required: true },
  tm2Title: { type: String, required: true },
  tm2Confidence: { type: Number, default: 0.5 },
  
  // Layer 3: ICD-11 MMS (Biomedical Output)
  icdCode: { type: String, required: true },
  icdTitle: { type: String, required: true },
  icdConfidence: { type: Number, default: 0.5 },
  
  // Overall mapping confidence (combined layers)
  overallConfidence: { type: Number, default: 0.5 },
  
  // Traditional system classification
  traditionalSystem: { type: String, enum: ['Ayurveda', 'Unani', 'Siddha', 'Homeopathy', 'Other'] },
  
  // Mapping metadata
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  curatorApproved: { type: Boolean, default: false }
}, { collection: "mapping_collection" });

// Create indexes for better performance
MappingSchema.index({ namasteCode: 1 });
MappingSchema.index({ tm2Code: 1 });
MappingSchema.index({ icdCode: 1 });
MappingSchema.index({ traditionalSystem: 1 });
MappingSchema.index({ overallConfidence: -1 });

module.exports = mongoose.model('Mapping', MappingSchema);
