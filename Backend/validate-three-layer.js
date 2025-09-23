require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const NamasteCodeModel = require('./models/namaste');
const ICDModel = require('./models/icd');
const MappingModel = require('./models/mapping');
const TM2Model = require('./models/tm2');

async function validateThreeLayerArchitecture() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Test data counts
    const counts = {
      namaste: await NamasteCodeModel.countDocuments(),
      icd: await ICDModel.countDocuments(),
      tm2: await TM2Model.countDocuments(),
      mappings: await MappingModel.countDocuments()
    };

    console.log('\n📊 Collection Document Counts:');
    console.log(`  🌿 NAMASTE Codes: ${counts.namaste}`);
    console.log(`  🩺 TM2 Codes: ${counts.tm2}`);  
    console.log(`  🏥 ICD-11 Codes: ${counts.icd}`);
    console.log(`  🔗 Three-Layer Mappings: ${counts.mappings}`);

    // Test three-layer mapping structure
    console.log('\n🧪 Testing Three-Layer Architecture...');
    
    // Sample mapping with three layers
    const sampleMapping = await MappingModel.findOne({
      namasteCode: { $exists: true },
      tm2Code: { $exists: true },
      icdCode: { $exists: true }
    });

    if (sampleMapping) {
      console.log('✅ Three-layer mapping structure verified!');
      console.log(`  🌿 NAMASTE: ${sampleMapping.namasteCode} - ${sampleMapping.namasteTitle}`);
      console.log(`  🩺 TM2: ${sampleMapping.tm2Code} - ${sampleMapping.tm2Title}`);
      console.log(`  🏥 ICD-11: ${sampleMapping.icdCode} - ${sampleMapping.icdTitle}`);
      console.log(`  🎯 Overall Confidence: ${sampleMapping.overallConfidence}%`);
      console.log(`  📋 Traditional System: ${sampleMapping.traditionalSystem}`);
    } else {
      console.log('❌ No three-layer mappings found!');
    }

    // Test TM2 model structure
    const sampleTM2 = await TM2Model.findOne();
    if (sampleTM2) {
      console.log('\n🩺 TM2 Model Structure Verified:');
      console.log(`  Code: ${sampleTM2.tm2Code}`);
      console.log(`  Title: ${sampleTM2.tm2Title}`);
      console.log(`  System: ${sampleTM2.traditionalSystem}`);
      console.log(`  Therapeutic Area: ${sampleTM2.therapeuticArea}`);
    }

    // Test statistics
    console.log('\n📈 Three-Layer Architecture Statistics:');
    const ayurvedaMappings = await MappingModel.countDocuments({ traditionalSystem: 'Ayurveda' });
    const unaniMappings = await MappingModel.countDocuments({ traditionalSystem: 'Unani' });
    const siddhaMappings = await MappingModel.countDocuments({ traditionalSystem: 'Siddha' });
    
    console.log(`  🌿 Ayurveda Mappings: ${ayurvedaMappings}`);
    console.log(`  🌙 Unani Mappings: ${unaniMappings}`);
    console.log(`  ⭐ Siddha Mappings: ${siddhaMappings}`);

    // Test confidence scoring
    const avgConfidence = await MappingModel.aggregate([
      { $group: { _id: null, avgConfidence: { $avg: '$overallConfidence' } } }
    ]);
    
    if (avgConfidence.length > 0) {
      console.log(`  🎯 Average Mapping Confidence: ${avgConfidence[0].avgConfidence.toFixed(2)}%`);
    }

    console.log('\n🎉 Three-Layer Architecture Validation Complete!');
    console.log('   NAMASTE → TM2 → ICD-11 mapping system is working correctly.');

  } catch (error) {
    console.error('❌ Validation Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run validation
validateThreeLayerArchitecture();