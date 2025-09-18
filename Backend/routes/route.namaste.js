const express = require('express');
const NamasteCode = require('../models/namaste');
const mongoose = require('mongoose');

const router = express.Router();

// Debug route to check collection
router.get('/debug', async (req, res) => {
  try {
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Get count from namaste_collection
    const count = await mongoose.connection.db
      .collection('namaste_collection')
      .countDocuments();

    // Get a sample document
    const sample = await mongoose.connection.db
      .collection('namaste_collection')
      .findOne({});

    res.json({
      collections: collections.map(c => c.name),
      namasteCollectionCount: count,
      sampleDocument: sample
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all codes (with optional search query)
router.get('/', async (req, res) => {
  try {
    console.log('Accessing namaste route - GET /');
    const { term } = req.query; // Change from search to term to match frontend

    let filter = {};
    if (term) {
      // Create word boundaries for more precise matching
      const searchTerms = term.trim().split(/\s+/).map(word => {
        // Escape special regex characters and create word boundary
        const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return `\\b${escaped}`;
      });
      
      // Join terms with AND logic for more precise matching
      const searchRegex = new RegExp(searchTerms.join('.*'), 'i');
      
      filter = {
        $or: [
          // Prioritize matches at the start of words
          { display: { $regex: searchRegex } },
          { code: { $regex: new RegExp(term, 'i') } }, // Exact code matching
          { synonyms: { $regex: searchRegex } }
        ]
      };
    }

    // Add limit to return only top matches
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    console.log('Querying database with filter:', filter);
    const codes = await NamasteCode.find(filter)
      .limit(limit)
      .sort({ display: 1 }) // Sort alphabetically by display name
      .select('code display system synonyms'); // Only select the fields we need
    console.log(`Found ${codes.length} documents`);
    
    if (codes.length === 0) {
      console.log('No documents found in collection');
      return res.status(200).json([]);
    }

    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    console.log('Sending response');
    res.status(200).json(codes);
  } catch (error) {
    console.error('Error in GET /:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// ✅ Get a single code by ID
router.get('/:id', async (req, res) => {
  try {
    const code = await NamasteCode.findById(req.params.id);
    if (!code) return res.status(404).json({ message: 'Code not found' });
    res.status(200).json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add a new code (optional, only if you need to add data manually)
router.post('/', async (req, res) => {
  try {
    const newCode = await NamasteCode.create(req.body);
    res.status(201).json(newCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
