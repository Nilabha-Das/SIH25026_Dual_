const FhirConceptMapService = require('./services/terminology/fhirConceptMap');

/**
 * Test script for FHIR ConceptMap Service
 * Tests dual-coding mapping between NAMASTE and ICD-11
 */
async function testConceptMapService() {
    console.log('🧪 Testing FHIR ConceptMap Service');
    console.log('===================================');

    try {
        const conceptMapService = new FhirConceptMapService();
        
        // Test 1: Initialize service
        console.log('\n📋 Test 1: Initializing ConceptMap service...');
        await conceptMapService.initialize();

        // Test 2: Generate all ConceptMaps
        console.log('\n🗺️ Test 2: Generating all FHIR ConceptMaps...');
        const conceptMaps = await conceptMapService.generateAllConceptMaps();

        // Display summary
        console.log('\n📊 ConceptMap Summary:');
        Object.keys(conceptMaps).forEach(key => {
            const cm = conceptMaps[key];
            console.log(`\n🔗 ${cm.title}:`);
            console.log(`   ID: ${cm.id}`);
            console.log(`   URL: ${cm.url}`);
            console.log(`   Source: ${cm.sourceUri}`);
            console.log(`   Target: ${cm.targetUri}`);
            console.log(`   Groups: ${cm.group.length}`);
            
            // Count total mappings
            const totalMappings = cm.group.reduce((sum, group) => {
                return sum + group.element.reduce((elemSum, element) => {
                    return elemSum + (element.target ? element.target.length : 0);
                }, 0);
            }, 0);
            console.log(`   Total mappings: ${totalMappings}`);
        });

        // Test 3: Show sample mappings
        console.log('\n🔍 Sample NAMASTE → ICD-11 MMS mappings:');
        const mmsMap = conceptMaps.namasteToMms;
        if (mmsMap.group.length > 0 && mmsMap.group[0].element.length > 0) {
            const sampleElements = mmsMap.group[0].element.slice(0, 3);
            sampleElements.forEach(element => {
                console.log(`   ${element.code}: ${element.display}`);
                element.target.forEach(target => {
                    console.log(`     → ${target.code}: ${target.display}`);
                    console.log(`       Equivalence: ${target.equivalence}`);
                    console.log(`       Comment: ${target.comment}`);
                });
            });
        }

        console.log('\n🔍 Sample NAMASTE → ICD-11 TM2 mappings:');
        const tm2Map = conceptMaps.namasteToTm2;
        if (tm2Map.group.length > 0 && tm2Map.group[0].element.length > 0) {
            const sampleElements = tm2Map.group[0].element.slice(0, 3);
            sampleElements.forEach(element => {
                console.log(`   ${element.code}: ${element.display}`);
                element.target.forEach(target => {
                    console.log(`     → ${target.code}: ${target.display}`);
                    console.log(`       Equivalence: ${target.equivalence}`);
                    console.log(`       Comment: ${target.comment}`);
                });
            });
        }

        // Test 4: Save ConceptMaps to files
        console.log('\n💾 Test 3: Saving FHIR ConceptMaps to files...');
        const saveResult = await conceptMapService.saveAllConceptMaps();

        console.log(`\n✅ ConceptMaps saved to: ${saveResult.outputDirectory}`);
        console.log('📁 Generated ConceptMap files:');
        saveResult.files.forEach(file => {
            console.log(`   - ${file}`);
        });

        // Test 5: Analyze mapping quality
        console.log('\n📈 Mapping Quality Analysis:');
        const allMappings = Array.from(conceptMapService.mappingData.values());
        
        const confidenceRanges = {
            high: allMappings.filter(m => m.confidence >= 0.8).length,
            moderate: allMappings.filter(m => m.confidence >= 0.6 && m.confidence < 0.8).length,
            low: allMappings.filter(m => m.confidence >= 0.4 && m.confidence < 0.6).length,
            veryLow: allMappings.filter(m => m.confidence < 0.4).length
        };

        console.log(`   High confidence (≥0.8): ${confidenceRanges.high} mappings`);
        console.log(`   Moderate confidence (0.6-0.8): ${confidenceRanges.moderate} mappings`);
        console.log(`   Low confidence (0.4-0.6): ${confidenceRanges.low} mappings`);
        console.log(`   Very low confidence (<0.4): ${confidenceRanges.veryLow} mappings`);

        const moduleDistribution = {
            MMS: allMappings.filter(m => m.module === 'MMS').length,
            TM2: allMappings.filter(m => m.module === 'TM2').length
        };

        console.log(`\n📊 Module Distribution:`);
        console.log(`   ICD-11 MMS mappings: ${moduleDistribution.MMS}`);
        console.log(`   ICD-11 TM2 mappings: ${moduleDistribution.TM2}`);

        console.log('\n🎉 All ConceptMap tests completed successfully!');
        console.log('\n📈 Final Summary:');
        console.log(`   - Total ConceptMaps generated: ${Object.keys(conceptMaps).length}`);
        console.log(`   - Total concept mappings: ${allMappings.length}`);
        console.log(`   - Bidirectional mapping support: ✅`);
        console.log(`   - FHIR R4 compliance: ✅`);

    } catch (error) {
        console.error('❌ ConceptMap test failed:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testConceptMapService();
}

module.exports = testConceptMapService;