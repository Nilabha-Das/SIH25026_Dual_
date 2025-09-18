// Backend/routes/route.search.js
const express = require("express");
const router = express.Router();

const Namaste = require("../models/namaste");
const Mapping = require("../models/mapping");
const Icd = require("../models/icd");

// GET /api/search?term=diab&limit=12
router.get("/search", async (req, res) => {
  try {
    const term = (req.query.term || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "12", 10), 50);

    if (!term || term.length < 2) {
      return res.json([]); // need at least 2 chars
    }

    // --- Step 1: Find Namaste codes by text ---
    const namasteDocs = await Namaste.find({
      $or: [
        { display: { $regex: term, $options: "i" } },
        { code: { $regex: term, $options: "i" } },
        { synonyms: { $regex: term, $options: "i" } }
      ]
    }).limit(limit).lean();

    if (!namasteDocs.length) return res.json([]);

    // --- Step 2: Fetch mappings & ICDs ---
    const namasteCodes = namasteDocs.map(n => n.code);
    const mappings = await Mapping.find({ namasteCode: { $in: namasteCodes } }).lean();
    const icdCodes = mappings.map(m => m.icdCode);
    const icdDocs = await Icd.find({ code: { $in: icdCodes } }).lean();

    // --- Step 3: Attach ICD mappings to each NAMASTE record ---
    const results = namasteDocs.map(n => {
      const relMappings = mappings.filter(m => m.namasteCode === n.code);
      const icdMappings = relMappings.map(m => {
        const icd = icdDocs.find(i => i.code === m.icdCode);
        return {
          code: m.icdCode,
          confidence: m.confidence,
          module: m.module,
          title: icd ? icd.title : "No ICD title"
        };
      });

      return {
        code: n.code,
        display: n.display,
        system: n.system,
        synonyms: n.synonyms,
        icdMappings
      };
    });

    res.json(results);
  } catch (err) {
    console.error("❌ Search error", err);
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;
