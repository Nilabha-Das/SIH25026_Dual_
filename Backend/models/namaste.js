const mongoose = require('mongoose');

const NamasteSchema = new mongoose.Schema({
  code: String,
  display: String,
  system: String,
  synonyms: String
}, { collection: 'namaste_collection' });  // <-- IMPORTANT

module.exports = mongoose.model('Namaste', NamasteSchema);
