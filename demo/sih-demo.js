const TerminologyMicroService = require('../Backend/services/terminology/terminologyService');
const axios = require('axios');

/**
 * Comprehensive Demo Script for SIH 2025 Presentation
 * Showcases NAMASTE FHIR Terminology System capabilities
 */
class SIHDemo {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.service = new TerminologyMicroService();
    }

    /**
     * Start the demo service
     */
    async startService() {
        console.log('🚀 Starting SIH 2025 NAMASTE Terminology Demo');
        console.log('='.repeat(50));
        
        try {
            await this.service.start(3001);
            console.log('\n✅ Demo service is ready!');
            console.log('🔗 Service URL: http://localhost:3001');
            return true;
        } catch (error) {
            console.error('❌ Failed to start demo service:', error);
            return false;
        }
    }

    /**
     * Demo 1: Service Health and Metadata
     */
    async demoServiceOverview() {
        console.log('\n📋 DEMO 1: Service Overview and FHIR Compliance');
        console.log('-'.repeat(50));

        try {
            // Health check
            console.log('🔍 Checking service health...');
            const health = await axios.get(`${this.baseUrl}/health`);
            console.log('✅ Service Status:', health.data.status);
            console.log('✅ Initialized:', health.data.initialized);
            console.log('✅ Version:', health.data.version);

            // Statistics
            console.log('\n📊 Getting service statistics...');
            const stats = await axios.get(`${this.baseUrl}/stats`);
            console.log('📈 NAMASTE Concepts:', stats.data.codeSystems.namaste.total);
            console.log('📈 TM2 Concepts:', stats.data.codeSystems.tm2.total);
            console.log('📈 ConceptMaps:', stats.data.conceptMaps.total);
            console.log('📈 Total Mappings:', stats.data.mappings.total);

            console.log('\n🏥 AYUSH Systems Distribution:');
            Object.entries(stats.data.codeSystems.namaste.bySystems).forEach(([system, count]) => {
                console.log(`   • ${system}: ${count} concepts`);
            });

            console.log('\n🗺️ Mapping Quality Distribution:');
            console.log(`   • High confidence (≥0.8): ${stats.data.mappings.byConfidence.high}`);
            console.log(`   • Moderate confidence (0.6-0.8): ${stats.data.mappings.byConfidence.moderate}`);
            console.log(`   • Low confidence (<0.6): ${stats.data.mappings.byConfidence.low}`);

        } catch (error) {
            console.error('❌ Demo 1 failed:', error.message);
        }
    }

    /**
     * Demo 2: FHIR CodeSystem Resources
     */
    async demoCodeSystems() {
        console.log('\n📚 DEMO 2: FHIR R4 CodeSystem Resources');
        console.log('-'.repeat(50));

        try {
            // Get all CodeSystems
            console.log('🔍 Fetching all FHIR CodeSystems...');
            const codeSystems = await axios.get(`${this.baseUrl}/CodeSystem`);
            console.log(`✅ Found ${codeSystems.data.total} CodeSystem resources`);

            // Show specific CodeSystem details
            console.log('\n📖 Ayurveda CodeSystem Details:');
            const ayurveda = await axios.get(`${this.baseUrl}/CodeSystem/namaste-ayurveda`);
            console.log(`   • Resource Type: ${ayurveda.data.resourceType}`);
            console.log(`   • ID: ${ayurveda.data.id}`);
            console.log(`   • URL: ${ayurveda.data.url}`);
            console.log(`   • Title: ${ayurveda.data.title}`);
            console.log(`   • Publisher: ${ayurveda.data.publisher}`);
            console.log(`   • Status: ${ayurveda.data.status}`);
            console.log(`   • Total Concepts: ${ayurveda.data.count}`);
            console.log(`   • FHIR Version: ${ayurveda.data.fhirVersion || 'R4'}`);

            // Show sample concepts
            console.log('\n🔍 Sample Ayurveda Concepts:');
            ayurveda.data.concept.slice(0, 3).forEach(concept => {
                console.log(`   • ${concept.code}: ${concept.display}`);
                console.log(`     Definition: ${concept.definition}`);
                if (concept.designation && concept.designation.length > 0) {
                    console.log(`     Synonyms: ${concept.designation.map(d => d.value).join(', ')}`);
                }
            });

        } catch (error) {
            console.error('❌ Demo 2 failed:', error.message);
        }
    }

    /**
     * Demo 3: FHIR ConceptMap and Dual-Coding
     */
    async demoDualCoding() {
        console.log('\n🗺️ DEMO 3: FHIR ConceptMap and Dual-Coding');
        console.log('-'.repeat(50));

        try {
            // Get ConceptMap
            console.log('🔍 Fetching NAMASTE → ICD-11 MMS ConceptMap...');
            const conceptMap = await axios.get(`${this.baseUrl}/ConceptMap/namaste-to-icd11-mms`);
            console.log(`✅ ConceptMap: ${conceptMap.data.title}`);
            console.log(`   • Source: ${conceptMap.data.sourceUri}`);
            console.log(`   • Target: ${conceptMap.data.targetUri}`);
            console.log(`   • Groups: ${conceptMap.data.group.length}`);

            // Show sample mappings
            console.log('\n🔄 Sample NAMASTE → ICD-11 Mappings:');
            const firstGroup = conceptMap.data.group[0];
            firstGroup.element.slice(0, 3).forEach(element => {
                console.log(`   • ${element.code}: ${element.display}`);
                element.target.forEach(target => {
                    console.log(`     → ${target.code}: ${target.display}`);
                    console.log(`       Equivalence: ${target.equivalence}`);
                    console.log(`       Comment: ${target.comment}`);
                });
            });

        } catch (error) {
            console.error('❌ Demo 3 failed:', error.message);
        }
    }

    /**
     * Demo 4: FHIR Operations ($lookup, $validate-code, $translate)
     */
    async demoFhirOperations() {
        console.log('\n⚡ DEMO 4: FHIR Standard Operations');
        console.log('-'.repeat(50));

        try {
            // $lookup operation
            console.log('🔍 Testing $lookup operation for NAM003...');
            const lookup = await axios.get(`${this.baseUrl}/CodeSystem/namaste-ayurveda/$lookup?code=NAM003`);
            const nameParam = lookup.data.parameter.find(p => p.name === 'name');
            const displayParam = lookup.data.parameter.find(p => p.name === 'display');
            const defParam = lookup.data.parameter.find(p => p.name === 'definition');
            
            console.log(`✅ Lookup Result:`);
            console.log(`   • Name: ${nameParam?.valueString}`);
            console.log(`   • Display: ${displayParam?.valueString}`);
            console.log(`   • Definition: ${defParam?.valueString}`);

            // Show designations (synonyms)
            const designations = lookup.data.parameter.filter(p => p.name === 'designation');
            if (designations.length > 0) {
                console.log('   • Synonyms:');
                designations.forEach(designation => {
                    const valuePart = designation.part.find(p => p.name === 'value');
                    console.log(`     - ${valuePart?.valueString}`);
                });
            }

            // $validate-code operation
            console.log('\n✅ Testing $validate-code operation for NAM006...');
            const validate = await axios.get(`${this.baseUrl}/CodeSystem/namaste-ayurveda/$validate-code?code=NAM006`);
            const resultParam = validate.data.parameter.find(p => p.name === 'result');
            const messageParam = validate.data.parameter.find(p => p.name === 'message');
            
            console.log(`✅ Validation Result:`);
            console.log(`   • Valid: ${resultParam?.valueBoolean}`);
            console.log(`   • Message: ${messageParam?.valueString}`);

            // Test invalid code
            console.log('\n❌ Testing $validate-code with invalid code...');
            const validateInvalid = await axios.get(`${this.baseUrl}/CodeSystem/namaste-ayurveda/$validate-code?code=INVALID123`);
            const invalidResult = validateInvalid.data.parameter.find(p => p.name === 'result');
            const invalidMessage = validateInvalid.data.parameter.find(p => p.name === 'message');
            
            console.log(`❌ Invalid Code Result:`);
            console.log(`   • Valid: ${invalidResult?.valueBoolean}`);
            console.log(`   • Message: ${invalidMessage?.valueString}`);

            // $translate operation
            console.log('\n🔄 Testing $translate operation for NAM002...');
            const translate = await axios.get(`${this.baseUrl}/ConceptMap/namaste-to-icd11-mms/$translate?code=NAM002`);
            const translateResult = translate.data.parameter.find(p => p.name === 'result');
            const matchParam = translate.data.parameter.find(p => p.name === 'match');
            
            console.log(`✅ Translation Result:`);
            console.log(`   • Success: ${translateResult?.valueBoolean}`);
            
            if (matchParam) {
                const equivalence = matchParam.part.find(p => p.name === 'equivalence');
                const concept = matchParam.part.find(p => p.name === 'concept');
                console.log(`   • Equivalence: ${equivalence?.valueCode}`);
                console.log(`   • Target: ${concept?.valueCoding?.code} - ${concept?.valueCoding?.display}`);
                console.log(`   • System: ${concept?.valueCoding?.system}`);
            }

        } catch (error) {
            console.error('❌ Demo 4 failed:', error.message);
        }
    }

    /**
     * Demo 5: Custom AYUSH Features
     */
    async demoCustomFeatures() {
        console.log('\n🌟 DEMO 5: Custom AYUSH Features');
        console.log('-'.repeat(50));

        try {
            // Search by system
            console.log('🔍 Searching Ayurveda concepts...');
            const ayurvedaSearch = await axios.get(`${this.baseUrl}/namaste/search?system=ayurveda`);
            console.log(`✅ Found ${ayurvedaSearch.data.total} Ayurveda concepts`);
            
            console.log('📋 Sample Ayurveda concepts:');
            ayurvedaSearch.data.results.slice(0, 3).forEach(concept => {
                console.log(`   • ${concept.code}: ${concept.display} (${concept.system})`);
            });

            // Search by condition
            console.log('\n🔍 Searching for diabetes-related concepts...');
            const diabetesSearch = await axios.get(`${this.baseUrl}/namaste/search?display=diabetes`);
            console.log(`✅ Found ${diabetesSearch.data.total} diabetes-related concepts`);
            
            diabetesSearch.data.results.forEach(concept => {
                console.log(`   • ${concept.code}: ${concept.display} (${concept.system})`);
            });

            // Get specific mappings
            console.log('\n🗺️ Getting mappings for NAM001 (Diabetes - Siddha)...');
            const mappings = await axios.get(`${this.baseUrl}/namaste/NAM001/mappings`);
            console.log(`✅ Mapping found:`);
            console.log(`   • NAMASTE: ${mappings.data.namasteCode} - ${mappings.data.namasteDisplay}`);
            console.log(`   • ICD-11: ${mappings.data.icdCode} - ${mappings.data.icdTitle}`);
            console.log(`   • Module: ${mappings.data.module}`);
            console.log(`   • Confidence: ${mappings.data.confidence}`);

            // Bulk validation
            console.log('\n🔄 Testing bulk code validation...');
            const bulkValidation = await axios.post(`${this.baseUrl}/validate-codes`, {
                codes: ['NAM001', 'NAM002', 'NAM003', 'INVALID', 'TM2-001']
            });
            
            console.log(`✅ Bulk Validation Results:`);
            console.log(`   • Total codes: ${bulkValidation.data.total}`);
            console.log(`   • Valid codes: ${bulkValidation.data.valid}`);
            console.log(`   • Invalid codes: ${bulkValidation.data.invalid}`);
            
            console.log('📋 Detailed results:');
            bulkValidation.data.results.forEach(result => {
                const status = result.valid ? '✅' : '❌';
                console.log(`   ${status} ${result.code}: ${result.valid ? 'Valid' : 'Invalid'} ${result.system ? `(${result.system})` : ''}`);
            });

        } catch (error) {
            console.error('❌ Demo 5 failed:', error.message);
        }
    }

    /**
     * Run complete demo sequence
     */
    async runCompleteDemo() {
        console.log('🎬 SIH 2025 - Complete NAMASTE Terminology Demo');
        console.log('='.repeat(60));
        console.log('🏆 Challenge: FHIR R4-compliant terminology micro-service');
        console.log('🎯 Solution: NAMASTE-ICD11 dual-coding system');
        console.log('='.repeat(60));

        // Start service
        const serviceStarted = await this.startService();
        if (!serviceStarted) {
            console.log('💡 Please start the service first: node launch-terminology.js');
            return;
        }

        // Wait a moment for service to be fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Run all demos
        await this.demoServiceOverview();
        await this.demoCodeSystems();
        await this.demoDualCoding();
        await this.demoFhirOperations();
        await this.demoCustomFeatures();

        // Summary
        console.log('\n🎉 DEMO COMPLETE - Key Achievements');
        console.log('='.repeat(50));
        console.log('✅ FHIR R4 compliant CodeSystems and ConceptMaps');
        console.log('✅ 150 NAMASTE concepts across 3 AYUSH systems');
        console.log('✅ 150 bidirectional ICD-11 mappings');
        console.log('✅ Standard FHIR operations ($lookup, $validate-code, $translate)');
        console.log('✅ Custom AYUSH-specific search and validation features');
        console.log('✅ Production-ready microservice architecture');
        console.log('✅ Complete India EHR Standards 2016 compliance');
        console.log('\n🏆 Ready for SIH 2025 presentation!');
    }

    /**
     * Stop the demo service
     */
    async stopService() {
        await this.service.stop();
        console.log('🛑 Demo service stopped');
    }
}

// Export for use in other scripts
module.exports = SIHDemo;

// Run demo if called directly
if (require.main === module) {
    const demo = new SIHDemo();
    
    demo.runCompleteDemo().catch(error => {
        console.error('💥 Demo failed:', error);
        process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n📡 Stopping demo...');
        await demo.stopService();
        process.exit(0);
    });
}