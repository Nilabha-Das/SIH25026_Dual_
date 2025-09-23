const NamesteIngestionService = require('./namasteIngestion');

/**
 * FHIR ConceptMap Service for NAMASTE-ICD11 Dual Coding
 * Creates FHIR R4 ConceptMap resources to enable interoperability
 * between NAMASTE (AYUSH) terminologies and WHO ICD-11
 */
class FhirConceptMapService {
    constructor() {
        this.ingestionService = new NamesteIngestionService();
        this.mappingData = new Map();
        this.namasteData = new Map();
    }

    /**
     * Initialize service with terminology data
     */
    async initialize() {
        console.log('🚀 Initializing FHIR ConceptMap Service...');
        const data = await this.ingestionService.loadAllData();
        
        // Store data for quick access
        data.namaste.forEach(concept => {
            this.namasteData.set(concept.code, concept);
        });
        
        data.mappings.forEach(mapping => {
            this.mappingData.set(mapping.namasteCode, mapping);
        });

        console.log(`✅ Initialized with ${data.mappings.length} concept mappings`);
        return data;
    }

    /**
     * Generate FHIR ConceptMap for NAMASTE to ICD-11 MMS mappings
     */
    generateNamasteToIcd11MmsConceptMap() {
        const mmsmappings = Array.from(this.mappingData.values())
            .filter(mapping => mapping.module === 'MMS');

        const conceptMap = {
            resourceType: "ConceptMap",
            id: "namaste-to-icd11-mms",
            meta: {
                profile: ["http://hl7.org/fhir/StructureDefinition/ConceptMap"]
            },
            url: "http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11-mms",
            identifier: [{
                system: "http://ayush.gov.in/fhir/terminology",
                value: "NAMASTE-ICD11-MMS-MAP"
            }],
            version: "1.0.0",
            name: "NAMASTEToICD11MMSConceptMap",
            title: "NAMASTE to ICD-11 MMS ConceptMap",
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
            description: "FHIR R4 ConceptMap for mapping NAMASTE AYUSH terminologies to WHO ICD-11 Mortality and Morbidity Statistics (MMS)",
            jurisdiction: [{
                coding: [{
                    system: "urn:iso:std:iso:3166",
                    code: "IN",
                    display: "India"
                }]
            }],
            purpose: "Enable dual-coding between AYUSH traditional medicine concepts and international ICD-11 MMS classifications",
            copyright: "© Ministry of AYUSH, Government of India",
            sourceUri: "http://ayush.gov.in/fhir/ValueSet/namaste-all",
            targetUri: "http://id.who.int/icd/entity/mms",
            group: this.createConceptMapGroups(mmsmappings, 'MMS')
        };

        return conceptMap;
    }

    /**
     * Generate FHIR ConceptMap for NAMASTE to ICD-11 TM2 mappings
     */
    generateNamasteToIcd11Tm2ConceptMap() {
        const tm2Mappings = Array.from(this.mappingData.values())
            .filter(mapping => mapping.module === 'TM2');

        const conceptMap = {
            resourceType: "ConceptMap",
            id: "namaste-to-icd11-tm2",
            meta: {
                profile: ["http://hl7.org/fhir/StructureDefinition/ConceptMap"]
            },
            url: "http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11-tm2",
            identifier: [{
                system: "http://ayush.gov.in/fhir/terminology",
                value: "NAMASTE-ICD11-TM2-MAP"
            }],
            version: "1.0.0",
            name: "NAMASTEToICD11TM2ConceptMap",
            title: "NAMASTE to ICD-11 TM2 ConceptMap",
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
            description: "FHIR R4 ConceptMap for mapping NAMASTE AYUSH terminologies to WHO ICD-11 Traditional Medicine Module 2 (TM2)",
            jurisdiction: [{
                coding: [{
                    system: "urn:iso:std:iso:3166",
                    code: "IN",
                    display: "India"
                }]
            }],
            purpose: "Enable seamless mapping between Indian AYUSH traditional medicine concepts and WHO ICD-11 TM2 classifications",
            copyright: "© Ministry of AYUSH, Government of India",
            sourceUri: "http://ayush.gov.in/fhir/ValueSet/namaste-all",
            targetUri: "http://id.who.int/icd/entity/tm2",
            group: this.createConceptMapGroups(tm2Mappings, 'TM2')
        };

        return conceptMap;
    }

    /**
     * Create ConceptMap groups organized by AYUSH system
     */
    createConceptMapGroups(mappings, targetModule) {
        // Group mappings by AYUSH system
        const systemGroups = mappings.reduce((groups, mapping) => {
            const namasteConcept = this.namasteData.get(mapping.namasteCode);
            if (!namasteConcept) return groups;

            const system = namasteConcept.system;
            if (!groups[system]) {
                groups[system] = [];
            }
            groups[system].push(mapping);
            return groups;
        }, {});

        const groups = [];

        Object.keys(systemGroups).forEach(systemName => {
            const systemMappings = systemGroups[systemName];
            
            const group = {
                source: `http://ayush.gov.in/fhir/CodeSystem/namaste-${systemName.toLowerCase()}`,
                target: targetModule === 'TM2' 
                    ? "http://id.who.int/icd/entity/tm2"
                    : "http://id.who.int/icd/entity/mms",
                element: systemMappings.map(mapping => {
                    const namasteConcept = this.namasteData.get(mapping.namasteCode);
                    
                    return {
                        code: mapping.namasteCode,
                        display: mapping.namasteDisplay,
                        target: [{
                            code: mapping.icdCode,
                            display: mapping.icdTitle,
                            equivalence: this.getEquivalenceLevel(mapping.confidence),
                            comment: `Semantic mapping with confidence ${mapping.confidence}. Source: ${namasteConcept.system} system.`,
                            dependsOn: [{
                                property: "confidence",
                                value: mapping.confidence.toString()
                            }, {
                                property: "source_system",
                                value: namasteConcept.system
                            }]
                        }]
                    };
                })
            };

            groups.push(group);
        });

        return groups;
    }

    /**
     * Determine FHIR equivalence level based on confidence score
     */
    getEquivalenceLevel(confidence) {
        if (confidence >= 0.8) {
            return "equivalent"; // High confidence
        } else if (confidence >= 0.6) {
            return "wider"; // Moderate confidence - target is broader
        } else if (confidence >= 0.4) {
            return "narrower"; // Lower confidence - target is more specific
        } else {
            return "unmatched"; // Very low confidence
        }
    }

    /**
     * Generate bidirectional ConceptMaps (ICD-11 to NAMASTE)
     */
    generateIcd11ToNamasteConceptMaps() {
        const mmsToNamaste = this.generateReverseConceptMap('MMS');
        const tm2ToNamaste = this.generateReverseConceptMap('TM2');

        return {
            mmsToNamaste,
            tm2ToNamaste
        };
    }

    /**
     * Generate reverse ConceptMap (ICD-11 to NAMASTE)
     */
    generateReverseConceptMap(module) {
        const mappings = Array.from(this.mappingData.values())
            .filter(mapping => mapping.module === module);

        const conceptMap = {
            resourceType: "ConceptMap",
            id: `icd11-${module.toLowerCase()}-to-namaste`,
            meta: {
                profile: ["http://hl7.org/fhir/StructureDefinition/ConceptMap"]
            },
            url: `http://ayush.gov.in/fhir/ConceptMap/icd11-${module.toLowerCase()}-to-namaste`,
            identifier: [{
                system: "http://ayush.gov.in/fhir/terminology",
                value: `ICD11-${module}-NAMASTE-MAP`
            }],
            version: "1.0.0",
            name: `ICD11${module}ToNAMASTEConceptMap`,
            title: `ICD-11 ${module} to NAMASTE ConceptMap`,
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
            description: `FHIR R4 ConceptMap for mapping WHO ICD-11 ${module} codes to NAMASTE AYUSH terminologies`,
            jurisdiction: [{
                coding: [{
                    system: "urn:iso:std:iso:3166",
                    code: "IN",
                    display: "India"
                }]
            }],
            purpose: `Enable reverse mapping from international ICD-11 ${module} to Indian AYUSH traditional medicine concepts`,
            copyright: "© Ministry of AYUSH, Government of India",
            sourceUri: module === 'TM2' 
                ? "http://id.who.int/icd/entity/tm2"
                : "http://id.who.int/icd/entity/mms",
            targetUri: "http://ayush.gov.in/fhir/ValueSet/namaste-all",
            group: this.createReverseConceptMapGroups(mappings, module)
        };

        return conceptMap;
    }

    /**
     * Create reverse ConceptMap groups (ICD-11 to NAMASTE)
     */
    createReverseConceptMapGroups(mappings, sourceModule) {
        // Group by ICD code for reverse mapping
        const icdGroups = mappings.reduce((groups, mapping) => {
            const icdCode = mapping.icdCode;
            if (!groups[icdCode]) {
                groups[icdCode] = [];
            }
            groups[icdCode].push(mapping);
            return groups;
        }, {});

        const group = {
            source: sourceModule === 'TM2' 
                ? "http://id.who.int/icd/entity/tm2"
                : "http://id.who.int/icd/entity/mms",
            target: "http://ayush.gov.in/fhir/ValueSet/namaste-all",
            element: Object.keys(icdGroups).map(icdCode => {
                const mappingsForCode = icdGroups[icdCode];
                const firstMapping = mappingsForCode[0];

                return {
                    code: icdCode,
                    display: firstMapping.icdTitle,
                    target: mappingsForCode.map(mapping => {
                        const namasteConcept = this.namasteData.get(mapping.namasteCode);
                        
                        return {
                            code: mapping.namasteCode,
                            display: mapping.namasteDisplay,
                            equivalence: this.getEquivalenceLevel(mapping.confidence),
                            comment: `Reverse semantic mapping with confidence ${mapping.confidence}. Target: ${namasteConcept.system} system.`,
                            dependsOn: [{
                                property: "confidence",
                                value: mapping.confidence.toString()
                            }, {
                                property: "target_system",
                                value: namasteConcept.system
                            }]
                        };
                    })
                };
            })
        };

        return [group];
    }

    /**
     * Generate all ConceptMaps
     */
    async generateAllConceptMaps() {
        await this.initialize();

        console.log('🗺️ Generating FHIR ConceptMaps...');

        const conceptMaps = {
            namasteToMms: this.generateNamasteToIcd11MmsConceptMap(),
            namasteToTm2: this.generateNamasteToIcd11Tm2ConceptMap(),
            ...this.generateIcd11ToNamasteConceptMaps()
        };

        console.log('✅ Generated all ConceptMaps:');
        console.log(`   - NAMASTE → ICD-11 MMS: ${conceptMaps.namasteToMms.group.reduce((sum, g) => sum + g.element.length, 0)} mappings`);
        console.log(`   - NAMASTE → ICD-11 TM2: ${conceptMaps.namasteToTm2.group.reduce((sum, g) => sum + g.element.length, 0)} mappings`);
        console.log(`   - ICD-11 MMS → NAMASTE: ${conceptMaps.mmsToNamaste.group[0].element.length} reverse mappings`);
        console.log(`   - ICD-11 TM2 → NAMASTE: ${conceptMaps.tm2ToNamaste.group[0].element.length} reverse mappings`);

        return conceptMaps;
    }

    /**
     * Save all ConceptMaps to files
     */
    async saveAllConceptMaps() {
        const fs = require('fs').promises;
        const path = require('path');
        
        const conceptMaps = await this.generateAllConceptMaps();
        const outputDir = path.join(__dirname, 'fhir-output');

        const files = [];

        // Save each ConceptMap
        for (const [key, conceptMap] of Object.entries(conceptMaps)) {
            const filename = `${conceptMap.id}.json`;
            const filepath = path.join(outputDir, filename);
            
            await fs.writeFile(
                filepath,
                JSON.stringify(conceptMap, null, 2),
                'utf8'
            );
            
            console.log(`💾 Saved FHIR ConceptMap: ${filename}`);
            files.push(filename);
        }

        return {
            outputDirectory: outputDir,
            files,
            conceptMaps
        };
    }
}

module.exports = FhirConceptMapService;