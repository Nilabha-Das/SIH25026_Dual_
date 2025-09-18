require('dotenv').config();
const mongoose = require('mongoose');
const Mapping = require('./models/mapping');

async function fixMappings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all documents
    const mappings = await Mapping.find({});
    console.log(`Found ${mappings.length} mappings to fix`);

    // Update each document to use the correct field names
    for (const mapping of mappings) {
      const updatedMapping = {
        namasteCode: mapping.namaste_code,
        namasteDisplay: mapping.namaste_display,
        icdCode: mapping.icd_code,
        icdTitle: mapping.icd_title,
        module: mapping.module || 'MMS',  // default to MMS if not specified
        confidence: mapping.confidence || 0.5  // default to 0.5 if not specified
      };

      await Mapping.findByIdAndUpdate(mapping._id, updatedMapping);
      console.log(`Updated mapping for NAMASTE code: ${mapping.namaste_code}`);
    }

    console.log('All mappings updated successfully');
  } catch (error) {
    console.error('Error fixing mappings:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixMappings();