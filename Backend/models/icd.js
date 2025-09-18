// models/icd.js
const mongoose = require('mongoose');

const icdSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  classKind: { type: String },
  parent: { type: String }
}, { collection: "icd_collection" });

module.exports = mongoose.model("ICD", icdSchema);
