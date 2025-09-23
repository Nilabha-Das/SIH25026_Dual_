const NamesteIngestionService = require('./services/terminology/namasteIngestion');

/**
 * Test script for NAMASTE Terminology Ingestion Service
 * Tests FHIR R4 CodeSystem generation from NAMASTE CSV data
 */
async function testNamesteIngestion() {
    console.log('🧪 Testing NAMASTE Terminology Ingestion Service');
    console.log('================================================');

    try {
        const ingestionService = new NamesteIngestionService();
        
        // Test 1: Load all data
        console.log('\n📋 Test 1: Loading all terminology data...');
        const data = await ingestionService.loadAllData();
        
        console.log('\n📊 Data loaded successfully:');
        console.log(`   - NAMASTE concepts: ${data.namaste.length}`);
        console.log(`   - TM2 concepts: ${data.tm2.length}`);
        console.log(`   - Mappings: ${data.mappings.length}`);

        // Test 2: Show sample NAMASTE concepts
        console.log('\n🔍 Sample NAMASTE concepts:');
        data.namaste.slice(0, 3).forEach(concept => {
            console.log(`   ${concept.code}: ${concept.display} (${concept.system})`);
            console.log(`      Synonyms: ${concept.synonyms.join(', ')}`);
        });

        // Test 3: Show sample TM2 concepts
        console.log('\n🔍 Sample TM2 concepts:');
        data.tm2.slice(0, 3).forEach(concept => {
            console.log(`   ${concept.code}: ${concept.display}`);
            console.log(`      Class: ${concept.classKind}, Parent: ${concept.parent}`);
        });

        // Test 4: Show sample mappings
        console.log('\n🔍 Sample mappings:');
        data.mappings.slice(0, 3).forEach(mapping => {
            console.log(`   ${mapping.namasteCode} -> ${mapping.icdCode}`);
            console.log(`      ${mapping.namasteDisplay} -> ${mapping.icdTitle}`);
            console.log(`      Confidence: ${mapping.confidence}, Module: ${mapping.module}`);
        });

        // Test 5: Generate FHIR CodeSystems
        console.log('\n🏥 Test 2: Generating FHIR R4 CodeSystems...');
        const fhirData = await ingestionService.generateAllFhirCodeSystems();
        
        console.log(`\n✅ FHIR CodeSystems generated:`);
        console.log(`   - NAMASTE systems: ${fhirData.namaste.length}`);
        console.log(`   - TM2 system concepts: ${fhirData.tm2.count}`);

        // Show NAMASTE CodeSystems by AYUSH system
        console.log('\n📚 NAMASTE CodeSystems by AYUSH system:');
        fhirData.namaste.forEach(codeSystem => {
            console.log(`   - ${codeSystem.title}: ${codeSystem.count} concepts`);
            console.log(`     URL: ${codeSystem.url}`);
            console.log(`     ID: ${codeSystem.id}`);
        });

        // Show TM2 CodeSystem details
        console.log('\n📚 TM2 CodeSystem:');
        console.log(`   - ${fhirData.tm2.title}: ${fhirData.tm2.count} concepts`);
        console.log(`     URL: ${fhirData.tm2.url}`);
        console.log(`     ID: ${fhirData.tm2.id}`);

        // Test 6: Save to files
        console.log('\n💾 Test 3: Saving FHIR CodeSystems to files...');
        const saveResult = await ingestionService.saveFhirCodeSystems();
        
        console.log(`\n✅ Files saved to: ${saveResult.outputDirectory}`);
        console.log('📁 Generated files:');
        saveResult.files.forEach(file => {
            console.log(`   - ${file}`);
        });

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📈 Final Summary:');
        console.log(`   - NAMASTE CodeSystems: ${saveResult.summary.namasteSystemsCount}`);
        console.log(`   - TM2 concepts: ${saveResult.summary.tm2ConceptsCount}`);
        console.log(`   - Total mappings: ${saveResult.summary.totalMappings}`);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testNamesteIngestion();
}

module.exports = testNamesteIngestion;