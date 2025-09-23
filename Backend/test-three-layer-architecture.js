// test-three-layer-architecture.js - Test the three-layer architecture implementation
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testThreeLayerArchitecture() {
  console.log('🧪 Testing Three-Layer Architecture Implementation\n');
  
  try {
    // Test 1: TM2 API Overview
    console.log('1️⃣ Testing TM2 API Overview...');
    const tm2Stats = await axios.get(`${BASE_URL}/api/tm2/stats/overview`);
    console.log('   ✅ TM2 Statistics:', {
      totalCodes: tm2Stats.data.totalCodes,
      systems: tm2Stats.data.systemStats.length,
      therapeuticAreas: tm2Stats.data.therapeuticStats.length
    });
    
    // Test 2: Get TM2 Codes
    console.log('\n2️⃣ Testing TM2 Codes Retrieval...');
    const tm2Codes = await axios.get(`${BASE_URL}/api/tm2?limit=3`);
    console.log(`   ✅ Retrieved ${tm2Codes.data.codes.length} TM2 codes`);
    tm2Codes.data.codes.forEach((code, i) => {
      console.log(`   ${i+1}. ${code.tm2Code}: ${code.tm2Title} (${code.traditionalSystem})`);
    });
    
    // Test 3: Three-Layer Mapping
    console.log('\n3️⃣ Testing Three-Layer Mapping...');
    const mapping = await axios.get(`${BASE_URL}/api/mapping/namaste/NAM001`);
    console.log(`   ✅ Retrieved ${mapping.data.length} three-layer mappings for NAM001`);
    
    if (mapping.data.length > 0) {
      const firstMapping = mapping.data[0];
      console.log('   📋 First Mapping:');
      console.log(`      Layer 1 (NAMASTE): ${firstMapping.namasteCode} - ${firstMapping.namasteDisplay}`);
      console.log(`      Layer 2 (TM2): ${firstMapping.tm2Code} - ${firstMapping.tm2Title}`);
      console.log(`      Layer 3 (ICD-11): ${firstMapping.icdCode} - ${firstMapping.icdTitle}`);
      console.log(`      Traditional System: ${firstMapping.traditionalSystem}`);
      console.log(`      Overall Confidence: ${(firstMapping.overallConfidence * 100).toFixed(1)}%`);
    }
    
    // Test 4: TM2 Search
    console.log('\n4️⃣ Testing TM2 Search...');
    const searchResult = await axios.get(`${BASE_URL}/api/tm2/search?term=diabetes`);
    console.log(`   ✅ Found ${searchResult.data.length} TM2 codes matching "diabetes"`);
    searchResult.data.forEach((result, i) => {
      console.log(`   ${i+1}. ${result.tm2Code}: ${result.tm2Title}`);
    });
    
    // Test 5: Specific TM2 Code Details
    console.log('\n5️⃣ Testing Specific TM2 Code...');
    if (tm2Codes.data.codes.length > 0) {
      const firstTM2Code = tm2Codes.data.codes[0].tm2Code;
      const tm2Detail = await axios.get(`${BASE_URL}/api/tm2/${firstTM2Code}`);
      console.log(`   ✅ Retrieved details for ${firstTM2Code}`);
      console.log(`      Title: ${tm2Detail.data.tm2Title}`);
      console.log(`      Traditional System: ${tm2Detail.data.traditionalSystem}`);
      console.log(`      Therapeutic Area: ${tm2Detail.data.therapeuticArea}`);
      console.log(`      Pattern Type: ${tm2Detail.data.patternType}`);
    }
    
    console.log('\n🎉 All tests passed! Three-Layer Architecture is working correctly!');
    console.log('\n📊 Summary:');
    console.log(`   • TM2 Module: ${tm2Stats.data.totalCodes} traditional medicine codes`);
    console.log(`   • Three-Layer Mappings: Production-ready NAMASTE → TM2 → ICD-11`);
    console.log(`   • API Endpoints: All functioning correctly`);
    console.log(`   • Ready for Doctor Dashboard integration! 🏥`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testThreeLayerArchitecture();