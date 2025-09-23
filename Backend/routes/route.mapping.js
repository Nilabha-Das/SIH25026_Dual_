const express = require('express');
const Mapping = require('../models/mapping');
const IcdCode = require('../models/icd');
const TM2 = require('../models/tm2'); // TM2 for three-layer architecture

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

// ✅ Three-Layer Architecture: Get complete NAMASTE → TM2 → ICD-11 mapping
router.get('/namaste/:code', async (req, res) => {
  try {
    console.log('Finding three-layer mappings for NAMASTE code:', req.params.code);
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

    // Get TM2 codes and ICD codes from mappings
    const tm2Codes = mappings.map(m => m.tm2Code).filter(Boolean);
    const icdCodes = mappings.map(m => m.icd_code || m.icdCode).filter(Boolean);
    
    console.log('Looking up TM2 codes:', tm2Codes);
    console.log('Looking up ICD codes:', icdCodes);

    // Fetch TM2 and ICD details in parallel
    const [tm2Details, icdDetails] = await Promise.all([
      TM2.find({ tm2Code: { $in: tm2Codes } }),
      IcdCode.find({ code: { $in: icdCodes } })
    ]);
    
    console.log('Found TM2 details:', tm2Details);
    console.log('Found ICD details:', icdDetails);

    // Create three-layer mapping result
    const result = mappings.map(m => {
      const mapping = m.toObject();
      const tm2Detail = tm2Details.find(t => t.tm2Code === mapping.tm2Code);
      const icdDetail = icdDetails.find(i => i.code === (mapping.icd_code || mapping.icdCode));
      
      console.log('Processing three-layer mapping:', {
        namasteCode: mapping.namaste_code || mapping.namasteCode,
        tm2Code: mapping.tm2Code,
        icdCode: mapping.icd_code || mapping.icdCode,
        foundTm2Detail: !!tm2Detail,
        foundIcdDetail: !!icdDetail
      });

      return {
        // Layer 1: NAMASTE
        namasteCode: mapping.namaste_code || mapping.namasteCode,
        namasteDisplay: mapping.namasteDisplay || mapping.namaste_display,
        
        // Layer 2: TM2 (Traditional Medicine Bridge)
        tm2Code: mapping.tm2Code,
        tm2Title: mapping.tm2Title || tm2Detail?.tm2Title,
        tm2Confidence: mapping.tm2Confidence,
        tm2Details: tm2Detail,
        traditionalSystem: mapping.traditionalSystem || tm2Detail?.traditionalSystem,
        
        // Layer 3: ICD-11 MMS (Biomedical)
        icdCode: mapping.icd_code || mapping.icdCode,
        icdTitle: mapping.icdTitle || icdDetail?.title || mapping.icd_title,
        icdConfidence: mapping.icdConfidence,
        icdDetails: icdDetail,
        
        // Overall mapping metadata
        overallConfidence: mapping.overallConfidence,
        module: mapping.module || 'Three-Layer',
        confidence: mapping.confidence || mapping.overallConfidence,
        mappingType: 'three-layer',
        
        // Legacy fields for backward compatibility
        ...mapping
      };
    });

    console.log('Sending three-layer response:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in three-layer mapping:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get TM2 to ICD-11 mappings (Layer 2 → Layer 3)
router.get('/tm2/:tm2Code/icd', async (req, res) => {
  try {
    const tm2Code = req.params.tm2Code;
    console.log('Finding ICD mappings for TM2 code:', tm2Code);
    
    const mappings = await Mapping.find({ tm2Code });
    
    if (!mappings.length) {
      return res.json([]);
    }
    
    const icdCodes = mappings.map(m => m.icdCode).filter(Boolean);
    const icdDetails = await IcdCode.find({ code: { $in: icdCodes } });
    
    const result = mappings.map(m => ({
      tm2Code: m.tm2Code,
      tm2Title: m.tm2Title,
      icdCode: m.icdCode,
      icdTitle: m.icdTitle,
      icdConfidence: m.icdConfidence,
      icdDetails: icdDetails.find(i => i.code === m.icdCode)
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error in TM2 to ICD mapping:', error);
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
