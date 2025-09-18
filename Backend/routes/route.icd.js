const express = require('express');
const ICD11Code = require('../models/icd'); // <-- make sure you created ICD11Code schema

const router = express.Router();

// ✅ Get all ICD11 codes (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      // Case-insensitive search in code or title
      filter = {
        $or: [
          { code: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const codes = await ICD11Code.find(filter).limit(50); // Limit to avoid too large payload
    res.status(200).json(codes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get single ICD11 code by MongoDB ID
router.get('/:id', async (req, res) => {
  try {
    const code = await ICD11Code.findById(req.params.id);
    if (!code) return res.status(404).json({ message: 'ICD code not found' });
    res.status(200).json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add new ICD11 code (optional)
router.post('/', async (req, res) => {
  try {
    const newCode = await ICD11Code.create(req.body);
    res.status(201).json(newCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
