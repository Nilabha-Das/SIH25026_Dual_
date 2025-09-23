// routes/route.tm2.js - Traditional Medicine Module 2 API
const express = require('express');
const router = express.Router();
const TM2 = require('../models/tm2');

// Get all TM2 codes with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.traditionalSystem) {
      filter.traditionalSystem = req.query.traditionalSystem;
    }
    if (req.query.therapeuticArea) {
      filter.therapeuticArea = req.query.therapeuticArea;
    }
    if (req.query.patternType) {
      filter.patternType = req.query.patternType;
    }
    
    const tm2Codes = await TM2.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ tm2Code: 1 });
    
    const total = await TM2.countDocuments(filter);
    
    res.json({
      codes: tm2Codes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching TM2 codes:', error);
    res.status(500).json({ error: 'Failed to fetch TM2 codes' });
  }
});

// Search TM2 codes by text
router.get('/search', async (req, res) => {
  try {
    const { term, traditionalSystem, therapeuticArea } = req.query;
    
    if (!term || term.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }
    
    const searchFilter = {
      $or: [
        { tm2Title: { $regex: term, $options: 'i' } },
        { synonyms: { $in: [new RegExp(term, 'i')] } },
        { keywords: { $in: [new RegExp(term, 'i')] } },
        { tm2Code: { $regex: term, $options: 'i' } }
      ]
    };
    
    if (traditionalSystem) {
      searchFilter.traditionalSystem = traditionalSystem;
    }
    if (therapeuticArea) {
      searchFilter.therapeuticArea = therapeuticArea;
    }
    
    const results = await TM2.find(searchFilter)
      .limit(20)
      .sort({ tm2Code: 1 });
    
    res.json(results);
  } catch (error) {
    console.error('Error searching TM2 codes:', error);
    res.status(500).json({ error: 'Failed to search TM2 codes' });
  }
});

// Get specific TM2 code with its ICD mappings
router.get('/:tm2Code', async (req, res) => {
  try {
    const tm2Code = req.params.tm2Code;
    const tm2Entry = await TM2.findOne({ tm2Code });
    
    if (!tm2Entry) {
      return res.status(404).json({ error: 'TM2 code not found' });
    }
    
    res.json(tm2Entry);
  } catch (error) {
    console.error('Error fetching TM2 code:', error);
    res.status(500).json({ error: 'Failed to fetch TM2 code' });
  }
});

// Get TM2 hierarchy (children of a parent code)
router.get('/:parentCode/children', async (req, res) => {
  try {
    const parentCode = req.params.parentCode;
    const children = await TM2.find({ parent: parentCode })
      .sort({ tm2Code: 1 });
    
    res.json(children);
  } catch (error) {
    console.error('Error fetching TM2 children:', error);
    res.status(500).json({ error: 'Failed to fetch TM2 children' });
  }
});

// Get TM2 statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCodes = await TM2.countDocuments();
    
    const systemStats = await TM2.aggregate([
      { $group: { _id: '$traditionalSystem', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const therapeuticStats = await TM2.aggregate([
      { $group: { _id: '$therapeuticArea', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const patternStats = await TM2.aggregate([
      { $group: { _id: '$patternType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalCodes,
      systemStats,
      therapeuticStats,
      patternStats
    });
  } catch (error) {
    console.error('Error fetching TM2 statistics:', error);
    res.status(500).json({ error: 'Failed to fetch TM2 statistics' });
  }
});

module.exports = router;