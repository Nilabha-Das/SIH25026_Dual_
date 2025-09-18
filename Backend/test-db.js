require('dotenv').config();
const mongoose = require('mongoose');
const Namaste = require('./models/namaste');
const Mapping = require('./models/mapping');
const Icd = require('./models/icd');

async function testDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Count documents in each collection
        const namasteCount = await Namaste.countDocuments();
        const mappingCount = await Mapping.countDocuments();
        const icdCount = await Icd.countDocuments();

        console.log('Collection counts:');
        console.log('NAMASTE codes:', namasteCount);
        console.log('Mappings:', mappingCount);
        console.log('ICD codes:', icdCount);

        // Get a sample NAMASTE code and its mappings
        const sampleNamaste = await Namaste.findOne();
        if (sampleNamaste) {
            console.log('\nSample NAMASTE code:', sampleNamaste);
            
            const relatedMappings = await Mapping.find({ namasteCode: sampleNamaste.code });
            console.log('\nRelated mappings:', relatedMappings);

            if (relatedMappings.length > 0) {
                const icdCodes = await Icd.find({ 
                    code: { $in: relatedMappings.map(m => m.icdCode) } 
                });
                console.log('\nRelated ICD codes:', icdCodes);
            }
        }

    } catch (error) {
        console.error('Database test error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testDatabase();