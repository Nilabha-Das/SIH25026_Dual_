const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream } = require('fs');
const ConfidenceEnhancer = require('./confidenceEnhancer');

/**
 * NAMASTE Terminology Ingestion Service
 * Parses NAMASTE CSV files and creates FHIR R4 compliant CodeSystem resources
 * Supports: AYUSH terminologies (Ayurveda, Siddha, Unani, Homeopathy)
 */
class NamesteIngestionService {
    constructor() {
        this.dataPath = path.join(__dirname, '../../../icd_ingest');
        this.namasteData = new Map();
        this.tm2Data = new Map();
        this.mappingData = new Map();
        this.confidenceEnhancer = new ConfidenceEnhancer();
    }

    /**
     * Parse NAMASTE codes CSV file
     * Structure: code, display, system, synonyms
     */
    async parseNamasteCodes() {
        return new Promise((resolve, reject) => {
            const results = [];
            const filePath = path.join(this.dataPath, 'mock_namaste_codes_150.csv');
            
            createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    const concept = {
                        code: data.code,
                        display: data.display,
                        system: data.system,
                        synonyms: data.synonyms ? data.synonyms.split(';').map(s => s.trim()) : [],
                        definition: `${data.display} - ${data.system} terminology concept`
                    };
                    results.push(concept);
                    this.namasteData.set(data.code, concept);
                })
                .on('end', () => {
                    console.log(`✅ Parsed ${results.length} NAMASTE codes`);
                    resolve(results);
                })
                .on('error', reject);
        });
    }

    /**
     * Parse TM2 (Traditional Medicine Module 2) codes
     * Structure: code, title, class_kind, parent
     */
    async parseTM2Codes() {
        return new Promise((resolve, reject) => {
            const results = [];
            const filePath = path.join(this.dataPath, 'tm2_mock_150 (1).csv');
            
            createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    const concept = {
                        code: data.code,
                        display: data.title,
                        classKind: data.class_kind,
                        parent: data.parent,
                        definition: `TM2 concept: ${data.title} (${data.class_kind})`
                    };
                    results.push(concept);
                    this.tm2Data.set(data.code, concept);
                })
                .on('end', () => {
                    console.log(`✅ Parsed ${results.length} TM2 codes`);
                    resolve(results);
                })
                .on('error', reject);
        });
    }

    /**
     * Parse NAMASTE to ICD-11 semantic mappings
     * Structure: namaste_code, namaste_display, icd_code, icd_title, module, confidence
     */
    async parseMappings() {
        return new Promise((resolve, reject) => {
            const results = [];
            const filePath = path.join(this.dataPath, 'namaste_icd11_semantic_mapping.csv');
            
            createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    const mapping = {
                        namasteCode: data.namaste_code,
                        namasteDisplay: data.namaste_display,
                        icdCode: data.icd_code,
                        icdTitle: data.icd_title,
                        module: data.module, // MMS or TM2
                        confidence: parseFloat(data.confidence)
                    };
                    results.push(mapping);
                    this.mappingData.set(data.namaste_code, mapping);
                })
                .on('end', () => {
                    console.log(`✅ Parsed ${results.length} concept mappings`);
                    resolve(results);
                })
                .on('error', reject);
        });
    }

    /**
     * Generate FHIR R4 CodeSystem for NAMASTE terminologies
     */
    generateNamasteFhirCodeSystem() {
        const namasteArray = Array.from(this.namasteData.values());
        
        // Group by system (Ayurveda, Siddha, Unani, etc.)
        const systemGroups = namasteArray.reduce((groups, concept) => {
            if (!groups[concept.system]) {
                groups[concept.system] = [];
            }
            groups[concept.system].push(concept);
            return groups;
        }, {});

        const codeSystems = [];

        // Create separate CodeSystem for each AYUSH system
        Object.keys(systemGroups).forEach(systemName => {
            const concepts = systemGroups[systemName];
            
            const codeSystem = {
                resourceType: "CodeSystem",
                id: `namaste-${systemName.toLowerCase()}`,
                meta: {
                    profile: ["http://hl7.org/fhir/StructureDefinition/CodeSystem"]
                },
                url: `http://ayush.gov.in/fhir/CodeSystem/namaste-${systemName.toLowerCase()}`,
                identifier: [{
                    system: "http://ayush.gov.in/fhir/terminology",
                    value: `NAMASTE-${systemName.toUpperCase()}`
                }],
                version: "1.0.0",
                name: `NAMASTE${systemName}CodeSystem`,
                title: `NAMASTE ${systemName} Terminology CodeSystem`,
                status: "active",
                experimental: false,
                date: new Date().toISOString(),
                publisher: "Ministry of AYUSH, Government of India",
                contact: [{
                    name: "AYUSH Digital Health Mission",
                    telecom: [{
                        system: "url",
                        value: "http://ayush.gov.in"
                    }]
                }],
                description: `FHIR R4 CodeSystem for NAMASTE ${systemName} terminology as per India EHR Standards 2016`,
                jurisdiction: [{
                    coding: [{
                        system: "urn:iso:std:iso:3166",
                        code: "IN",
                        display: "India"
                    }]
                }],
                purpose: `Standardized terminology for ${systemName} medical concepts in Indian healthcare systems`,
                copyright: "© Ministry of AYUSH, Government of India",
                caseSensitive: true,
                valueSet: `http://ayush.gov.in/fhir/ValueSet/namaste-${systemName.toLowerCase()}`,
                hierarchyMeaning: "is-a",
                compositional: false,
                versionNeeded: false,
                content: "complete",
                count: concepts.length,
                concept: concepts.map(concept => ({
                    code: concept.code,
                    display: concept.display,
                    definition: concept.definition,
                    designation: concept.synonyms.map(synonym => ({
                        language: "en",
                        use: {
                            system: "http://snomed.info/sct",
                            code: "900000000000013009",
                            display: "Synonym"
                        },
                        value: synonym
                    })),
                    property: [{
                        code: "system",
                        valueString: concept.system
                    }]
                }))
            };

            codeSystems.push(codeSystem);
        });

        return codeSystems;
    }

    /**
     * Generate FHIR R4 CodeSystem for TM2 (Traditional Medicine Module 2)
     */
    generateTM2FhirCodeSystem() {
        const tm2Array = Array.from(this.tm2Data.values());

        const codeSystem = {
            resourceType: "CodeSystem",
            id: "icd11-tm2",
            meta: {
                profile: ["http://hl7.org/fhir/StructureDefinition/CodeSystem"]
            },
            url: "http://id.who.int/icd/entity/tm2",
            identifier: [{
                system: "http://who.int/fhir/terminology",
                value: "ICD-11-TM2"
            }],
            version: "2022-02",
            name: "ICD11TM2CodeSystem",
            title: "ICD-11 Traditional Medicine Module 2 (TM2) CodeSystem",
            status: "active",
            experimental: false,
            date: new Date().toISOString(),
            publisher: "World Health Organization (WHO)",
            contact: [{
                name: "WHO Classifications Team",
                telecom: [{
                    system: "url",
                    value: "https://icd.who.int"
                }]
            }],
            description: "FHIR R4 CodeSystem for ICD-11 Traditional Medicine Module 2 (TM2) terminology",
            jurisdiction: [{
                coding: [{
                    system: "http://unstats.un.org/unsd/methods/m49/m49.htm",
                    code: "001",
                    display: "World"
                }]
            }],
            purpose: "International standardized terminology for traditional medicine concepts",
            copyright: "© World Health Organization",
            caseSensitive: true,
            valueSet: "http://id.who.int/icd/entity/tm2/valueset",
            hierarchyMeaning: "is-a",
            compositional: false,
            versionNeeded: false,
            content: "complete",
            count: tm2Array.length,
            concept: tm2Array.map(concept => ({
                code: concept.code,
                display: concept.display,
                definition: concept.definition,
                property: [
                    {
                        code: "class_kind",
                        valueString: concept.classKind
                    },
                    {
                        code: "parent",
                        valueString: concept.parent
                    }
                ]
            }))
        };

        return codeSystem;
    }

    /**
     * Load and process all terminology data
     */
    async loadAllData() {
        try {
            console.log('🚀 Starting NAMASTE terminology ingestion...');
            
            await Promise.all([
                this.parseNamasteCodes(),
                this.parseTM2Codes(),
                this.parseMappings()
            ]);

            console.log('✅ All terminology data loaded successfully');
            console.log(`📊 Summary:`);
            console.log(`   - NAMASTE codes: ${this.namasteData.size}`);
            console.log(`   - TM2 codes: ${this.tm2Data.size}`);
            console.log(`   - Mappings: ${this.mappingData.size}`);

            // Enhance confidence scores for better distribution
            const rawMappings = Array.from(this.mappingData.values());
            const enhancedMappings = this.confidenceEnhancer.generateEnhancedMappings(rawMappings, this.namasteData);
            
            // Update the mapping data with enhanced confidence
            enhancedMappings.forEach(mapping => {
                this.mappingData.set(mapping.namasteCode, mapping);
            });

            const confidenceStats = this.confidenceEnhancer.getConfidenceStats(enhancedMappings);
            console.log(`🎯 Enhanced Confidence Distribution:`);
            console.log(`   - High (≥80%): ${confidenceStats.byConfidence.high} (${confidenceStats.percentages.high}%)`);
            console.log(`   - Moderate (60-80%): ${confidenceStats.byConfidence.moderate} (${confidenceStats.percentages.moderate}%)`);
            console.log(`   - Low (<60%): ${confidenceStats.byConfidence.low} (${confidenceStats.percentages.low}%)`);
            console.log(`   - Average: ${Math.round(confidenceStats.averageConfidence * 100)}%`);

            return {
                namaste: Array.from(this.namasteData.values()),
                tm2: Array.from(this.tm2Data.values()),
                mappings: enhancedMappings
            };
        } catch (error) {
            console.error('❌ Error loading terminology data:', error);
            throw error;
        }
    }

    /**
     * Generate all FHIR CodeSystems
     */
    async generateAllFhirCodeSystems() {
        await this.loadAllData();
        
        const namasteCodeSystems = this.generateNamasteFhirCodeSystem();
        const tm2CodeSystem = this.generateTM2FhirCodeSystem();

        return {
            namaste: namasteCodeSystems,
            tm2: tm2CodeSystem,
            summary: {
                namasteSystemsCount: namasteCodeSystems.length,
                tm2ConceptsCount: tm2CodeSystem.count,
                totalMappings: this.mappingData.size
            }
        };
    }

    /**
     * Save FHIR CodeSystems to files
     */
    async saveFhirCodeSystems() {
        const fhirData = await this.generateAllFhirCodeSystems();
        const outputDir = path.join(__dirname, 'fhir-output');
        
        // Create output directory
        try {
            await fs.mkdir(outputDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        // Save NAMASTE CodeSystems
        for (const codeSystem of fhirData.namaste) {
            const filename = `${codeSystem.id}.json`;
            const filepath = path.join(outputDir, filename);
            await fs.writeFile(
                filepath, 
                JSON.stringify(codeSystem, null, 2),
                'utf8'
            );
            console.log(`💾 Saved FHIR CodeSystem: ${filename}`);
        }

        // Save TM2 CodeSystem
        const tm2Filename = `${fhirData.tm2.id}.json`;
        const tm2Filepath = path.join(outputDir, tm2Filename);
        await fs.writeFile(
            tm2Filepath,
            JSON.stringify(fhirData.tm2, null, 2),
            'utf8'
        );
        console.log(`💾 Saved FHIR CodeSystem: ${tm2Filename}`);

        return {
            outputDirectory: outputDir,
            files: [
                ...fhirData.namaste.map(cs => `${cs.id}.json`),
                tm2Filename
            ],
            summary: fhirData.summary
        };
    }
}

module.exports = NamesteIngestionService;