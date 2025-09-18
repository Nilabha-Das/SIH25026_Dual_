// models/Mapping.js
const mongoose = require('mongoose');

const MappingSchema = new mongoose.Schema({
  namasteCode: { type: String, required: true },
  namasteDisplay: { type: String, required: true },
  icdCode: { type: String, required: true },
  icdTitle: { type: String, required: true },
  module: { type: String, default: 'MMS' },
  confidence: { type: Number, default: 0.5 }
}, { collection: "mapping_collection" });

module.exports = mongoose.model('Mapping', MappingSchema);
