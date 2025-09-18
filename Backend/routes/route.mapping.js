const express = require('express');
const Mapping = require('../models/mapping');
const IcdCode = require('../models/icd'); // To enrich mapping results if needed

const router = express.Router();

// ✅ Get all mappings (optional filter by NAMASTE code)
router.get('/', async (req, res) => {
  try {
    const { namaste_code, icd_code } = req.query;

    let filter = {};
    if (namaste_code) filter.namaste_code = namaste_code;
    if (icd_code) filter.icd_code = icd_code;

    const mappings = await Mapping.find(filter).limit(50);
    res.status(200).json(mappings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get mappings for a single NAMASTE code (with ICD details)
router.get('/namaste/:code', async (req, res) => {
  try {
    console.log('Finding mappings for NAMASTE code:', req.params.code);
    const mappings = await Mapping.find({ 
      $or: [
        { namaste_code: req.params.code },
        { namasteCode: req.params.code }
      ]
    });
    
    console.log('Found mappings:', mappings);

    if (!mappings.length) {
      console.log('No mappings found');
      return res.json([]);
    }

    // Get ICD codes from mappings, handling both field names
    const icdCodes = mappings.map(m => m.icd_code || m.icdCode).filter(Boolean);
    console.log('Looking up ICD codes:', icdCodes);

    // Fetch ICD details
    const icdDetails = await IcdCode.find({
      code: { $in: icdCodes }
    });
    
    console.log('Found ICD details:', icdDetails);

    // Merge mapping + ICD info with detailed logging
    const result = mappings.map(m => {
      const mapping = m.toObject();
      const icdDetail = icdDetails.find(i => i.code === (mapping.icd_code || mapping.icdCode));
      
      console.log('Processing mapping:', {
        namasteCode: mapping.namaste_code || mapping.namasteCode,
        icdCode: mapping.icd_code || mapping.icdCode,
        foundIcdDetail: !!icdDetail
      });

      return {
        ...mapping,
        icdDetails: icdDetail,
        // Add normalized fields to ensure consistency
        namasteCode: mapping.namaste_code || mapping.namasteCode,
        icdCode: mapping.icd_code || mapping.icdCode,
        icdTitle: icdDetail?.title || mapping.icd_title || mapping.icdTitle
      };
    });

    console.log('Sending response:', result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add new mapping (optional, if you want to POST data)
router.post('/', async (req, res) => {
  try {
    const newMapping = await Mapping.create(req.body);
    res.status(201).json(newMapping);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
