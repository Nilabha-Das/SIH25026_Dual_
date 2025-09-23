const TerminologyMicroService = require('./services/terminology/terminologyService');

/**
 * Launch script for NAMASTE Terminology Micro-service
 * Starts the FHIR-compliant terminology service
 */
async function launchTerminologyService() {
    console.log('🚀 Launching NAMASTE Terminology Micro-service');
    console.log('===============================================');

    try {
        const service = new TerminologyMicroService();
        
        // Start the service on port 3001 (separate from main backend on 3000)
        await service.start(3001);
        
        console.log('\n✅ Service started successfully!');
        console.log('\n🔗 Available Endpoints:');
        console.log('   📋 Health Check: http://localhost:3001/health');
        console.log('   📖 Service Metadata: http://localhost:3001/metadata');
        console.log('   📚 All CodeSystems: http://localhost:3001/CodeSystem');
        console.log('   🗺️ All ConceptMaps: http://localhost:3001/ConceptMap');
        console.log('   🔍 Search NAMASTE: http://localhost:3001/namaste/search?system=ayurveda');
        console.log('   📊 Service Statistics: http://localhost:3001/stats');
        
        console.log('\n🧪 Test URLs:');
        console.log('   • NAMASTE Ayurveda CodeSystem: http://localhost:3001/CodeSystem/namaste-ayurveda');
        console.log('   • TM2 CodeSystem: http://localhost:3001/CodeSystem/icd11-tm2');
        console.log('   • NAMASTE→ICD11 ConceptMap: http://localhost:3001/ConceptMap/namaste-to-icd11-mms');
        console.log('   • Code Lookup: http://localhost:3001/CodeSystem/namaste-ayurveda/$lookup?code=NAM003');
        console.log('   • Code Validation: http://localhost:3001/CodeSystem/namaste-ayurveda/$validate-code?code=NAM003');
        console.log('   • Code Translation: http://localhost:3001/ConceptMap/namaste-to-icd11-mms/$translate?code=NAM002');
        
        console.log('\n🌟 FHIR R4 Compliance Features:');
        console.log('   ✅ FHIR CodeSystem resources with proper structure');
        console.log('   ✅ FHIR ConceptMap resources for dual-coding');
        console.log('   ✅ FHIR CapabilityStatement for service discovery');
        console.log('   ✅ FHIR $lookup operation for concept details');
        console.log('   ✅ FHIR $validate-code operation for validation');
        console.log('   ✅ FHIR $translate operation for mapping');
        console.log('   ✅ RESTful API following FHIR patterns');
        console.log('   ✅ Bidirectional NAMASTE ↔ ICD-11 mapping');
        
        console.log('\n💡 Custom AYUSH Features:');
        console.log('   🔸 Multi-system support (Ayurveda, Siddha, Unani)');
        console.log('   🔸 Confidence-based mapping quality');
        console.log('   🔸 Bulk code validation endpoint');
        console.log('   🔸 Advanced search with system filtering');
        console.log('   🔸 Real-time statistics and monitoring');

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n📡 Received shutdown signal, stopping service...');
            await service.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to launch terminology service:', error);
        process.exit(1);
    }
}

// Launch if called directly
if (require.main === module) {
    launchTerminologyService();
}

module.exports = launchTerminologyService;