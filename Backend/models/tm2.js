// models/tm2.js - Traditional Medicine Module 2
const mongoose = require('mongoose');

const TM2Schema = new mongoose.Schema({
  // TM2 Code and Title
  tm2Code: { type: String, required: true, unique: true },
  tm2Title: { type: String, required: true },
  
  // Hierarchical Structure
  classKind: { type: String, enum: ['category', 'block', 'disorder'], default: 'category' },
  parent: { type: String }, // Parent TM2 code for hierarchy
  
  // Traditional Medicine Classification
  traditionalSystem: { type: String, enum: ['Ayurveda', 'Unani', 'Siddha', 'Homeopathy', 'Mixed'], default: 'Mixed' },
  therapeuticArea: { type: String }, // e.g., 'Digestive', 'Respiratory', 'Musculoskeletal'
  
  // Pattern Classification for Traditional Medicine
  patternType: { type: String, enum: ['Patterns', 'Disorders', 'Root', 'Symptoms'] },
  
  // Semantic Enhancement
  synonyms: [String],
  keywords: [String],
  description: String,
  
  // ICD-11 Bridge Mappings
  icdMappings: [{
    icdCode: String,
    icdTitle: String,
    confidence: { type: Number, min: 0, max: 1 },
    mappingType: { type: String, enum: ['direct', 'approximate', 'partial'] }
  }],
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, { 
  collection: "tm2_collection",
  timestamps: true 
});

// Indexes for better performance
TM2Schema.index({ tm2Code: 1 });
TM2Schema.index({ tm2Title: 'text', synonyms: 'text', keywords: 'text' });
TM2Schema.index({ traditionalSystem: 1, therapeuticArea: 1 });
TM2Schema.index({ patternType: 1 });

module.exports = mongoose.model('TM2', TM2Schema);