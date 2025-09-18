const express = require('express');
const Namaste = require('../models/namaste');
const ICD = require('../models/icd');
const Mapping = require('../models/mapping');

const router = express.Router();

router.get('/bundle', async (req, res) => {
  try {
    const namasteCodes = await Namaste.find().limit(20);
    const icdCodes = await ICD.find().limit(20);
    const mappings = await Mapping.find().limit(20);

    const bundle = {
      resourceType: "Bundle",
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        ...namasteCodes.map(n => ({
          resource: {
            resourceType: "Basic",
            id: n._id,
            code: {
              text: "Namaste Code"
            },
            extension: [
              { url: "code", valueString: n.code },
              { url: "display", valueString: n.display }
            ]
          }
        })),
        ...icdCodes.map(i => ({
          resource: {
            resourceType: "Basic",
            id: i._id,
            code: {
              text: "ICD11 Code"
            },
            extension: [
              { url: "code", valueString: i.code },
              { url: "title", valueString: i.title }
            ]
          }
        })),
        ...mappings.map(m => ({
          resource: {
            resourceType: "Basic",
            id: m._id,
            code: {
              text: "Mapping"
            },
            extension: [
              { url: "namaste_code", valueString: m.namaste_code },
              { url: "icd_code", valueString: m.icd_code },
              { url: "confidence", valueDecimal: m.confidence }
            ]
          }
        }))
      ]
    };

    res.json(bundle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
