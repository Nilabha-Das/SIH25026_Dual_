const express = require('express');
const NamesteIngestionService = require('./namasteIngestion');
const FhirConceptMapService = require('./fhirConceptMap');
const WHOIcd11ApiService = require('./whoIcd11Api');

/**
 * FHIR-compliant Terminology Micro-service
 * Provides RESTful APIs for NAMASTE-ICD11 terminology operations
 * Follows FHIR R4 Terminology Service patterns
 */
class TerminologyMicroService {
    constructor() {
        this.app = express();
        this.namasteService = new NamesteIngestionService();
        this.conceptMapService = new FhirConceptMapService();
        this.whoApiService = new WHOIcd11ApiService();
        this.isInitialized = false;
        
        // In-memory caches for fast lookups
        this.namasteData = new Map();
        this.tm2Data = new Map();
        this.mappingData = new Map();
        this.codeSystemsCache = new Map();
        this.conceptMapsCache = new Map();
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS for web applications
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Initialize service with terminology data
     */
    async initialize() {
        if (this.isInitialized) return;

        console.log('🚀 Initializing Terminology Micro-service...');
        
        try {
            // Load all terminology data
            const data = await this.namasteService.loadAllData();
            
            // Cache data for fast access
            data.namaste.forEach(concept => {
                this.namasteData.set(concept.code, concept);
            });
            
            data.tm2.forEach(concept => {
                this.tm2Data.set(concept.code, concept);
            });
            
            data.mappings.forEach(mapping => {
                this.mappingData.set(mapping.namasteCode, mapping);
            });

            // Generate and cache FHIR resources
            const codeSystems = await this.namasteService.generateAllFhirCodeSystems();
            codeSystems.namaste.forEach(cs => {
                this.codeSystemsCache.set(cs.id, cs);
            });
            this.codeSystemsCache.set(codeSystems.tm2.id, codeSystems.tm2);

            // Generate and cache ConceptMaps
            const conceptMaps = await this.conceptMapService.generateAllConceptMaps();
            Object.values(conceptMaps).forEach(cm => {
                this.conceptMapsCache.set(cm.id, cm);
            });

            this.isInitialized = true;
            console.log('✅ Terminology Micro-service initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Terminology Micro-service:', error);
            throw error;
        }
    }

    /**
     * Setup API routes following FHIR terminology service patterns
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                initialized: this.isInitialized,
                timestamp: new Date().toISOString(),
                service: 'NAMASTE-ICD11 Terminology Service',
                version: '1.0.0'
            });
        });

        // Service metadata (FHIR CapabilityStatement style)
        this.app.get('/metadata', async (req, res) => {
            await this.ensureInitialized();
            
            res.json({
                resourceType: "CapabilityStatement",
                id: "namaste-terminology-service",
                url: "http://ayush.gov.in/fhir/CapabilityStatement/namaste-terminology-service",
                version: "1.0.0",
                name: "NAMASTETerminologyService",
                title: "NAMASTE AYUSH Terminology Service",
                status: "active",
                experimental: false,
                date: new Date().toISOString(),
                publisher: "Ministry of AYUSH, Government of India",
                description: "FHIR R4 compliant terminology service for NAMASTE AYUSH terminologies and ICD-11 dual coding",
                fhirVersion: "4.0.1",
                format: ["json"],
                rest: [{
                    mode: "server",
                    resource: [
                        {
                            type: "CodeSystem",
                            supportedProfile: ["http://hl7.org/fhir/StructureDefinition/CodeSystem"],
                            interaction: [
                                { code: "read" },
                                { code: "search-type" }
                            ],
                            searchParam: [
                                { name: "code", type: "token" },
                                { name: "system", type: "uri" },
                                { name: "display", type: "string" }
                            ]
                        },
                        {
                            type: "ConceptMap",
                            supportedProfile: ["http://hl7.org/fhir/StructureDefinition/ConceptMap"],
                            interaction: [
                                { code: "read" },
                                { code: "search-type" }
                            ]
                        }
                    ],
                    operation: [
                        {
                            name: "lookup",
                            definition: "http://ayush.gov.in/fhir/OperationDefinition/CodeSystem-lookup"
                        },
                        {
                            name: "validate-code",
                            definition: "http://ayush.gov.in/fhir/OperationDefinition/CodeSystem-validate-code"  
                        },
                        {
                            name: "translate",
                            definition: "http://ayush.gov.in/fhir/OperationDefinition/ConceptMap-translate"
                        }
                    ]
                }]
            });
        });

        // FHIR CodeSystem endpoints
        this.app.get('/CodeSystem', async (req, res) => {
            await this.ensureInitialized();
            
            const codeSystems = Array.from(this.codeSystemsCache.values());
            res.json({
                resourceType: "Bundle",
                id: "codesystem-search-results",
                type: "searchset",
                total: codeSystems.length,
                entry: codeSystems.map(cs => ({
                    resource: cs,
                    fullUrl: `${req.protocol}://${req.get('host')}/CodeSystem/${cs.id}`
                }))
            });
        });

        this.app.get('/CodeSystem/:id', async (req, res) => {
            await this.ensureInitialized();
            
            const codeSystem = this.codeSystemsCache.get(req.params.id);
            if (!codeSystem) {
                return res.status(404).json({
                    resourceType: "OperationOutcome",
                    issue: [{
                        severity: "error",
                        code: "not-found",
                        diagnostics: `CodeSystem with id '${req.params.id}' not found`
                    }]
                });
            }
            
            res.json(codeSystem);
        });

        // FHIR ConceptMap endpoints
        this.app.get('/ConceptMap', async (req, res) => {
            await this.ensureInitialized();
            
            const conceptMaps = Array.from(this.conceptMapsCache.values());
            res.json({
                resourceType: "Bundle",
                id: "conceptmap-search-results",
                type: "searchset",
                total: conceptMaps.length,
                entry: conceptMaps.map(cm => ({
                    resource: cm,
                    fullUrl: `${req.protocol}://${req.get('host')}/ConceptMap/${cm.id}`
                }))
            });
        });

        this.app.get('/ConceptMap/:id', async (req, res) => {
            await this.ensureInitialized();
            
            const conceptMap = this.conceptMapsCache.get(req.params.id);
            if (!conceptMap) {
                return res.status(404).json({
                    resourceType: "OperationOutcome",
                    issue: [{
                        severity: "error",
                        code: "not-found",
                        diagnostics: `ConceptMap with id '${req.params.id}' not found`
                    }]
                });
            }
            
            res.json(conceptMap);
        });

        // FHIR $lookup operation
        this.app.get('/CodeSystem/:id/$lookup', async (req, res) => {
            await this.ensureInitialized();
            
            const { code, system } = req.query;
            
            if (!code) {
                return res.status(400).json({
                    resourceType: "OperationOutcome",
                    issue: [{
                        severity: "error",
                        code: "required",
                        diagnostics: "Parameter 'code' is required"
                    }]
                });
            }

            let concept = null;
            
            // Search in NAMASTE data
            if (this.namasteData.has(code)) {
                concept = this.namasteData.get(code);
            } else if (this.tm2Data.has(code)) {
                concept = this.tm2Data.get(code);
            }

            if (!concept) {
                return res.status(404).json({
                    resourceType: "OperationOutcome",
                    issue: [{
                        severity: "error",
                        code: "not-found",
                        diagnostics: `Code '${code}' not found`
                    }]
                });
            }

            const parameters = {
                resourceType: "Parameters",
                parameter: [
                    {
                        name: "name",
                        valueString: concept.display || concept.title
                    },
                    {
                        name: "display",
                        valueString: concept.display || concept.title
                    }
                ]
            };

            if (concept.definition) {
                parameters.parameter.push({
                    name: "definition",
                    valueString: concept.definition
                });
            }

            if (concept.synonyms && concept.synonyms.length > 0) {
                concept.synonyms.forEach(synonym => {
                    parameters.parameter.push({
                        name: "designation",
                        part: [
                            {
                                name: "language",
                                valueCode: "en"
                            },
                            {
                                name: "use",
                                valueCoding: {
                                    system: "http://snomed.info/sct",
                                    code: "900000000000013009",
                                    display: "Synonym"
                                }
                            },
                            {
                                name: "value",
                                valueString: synonym
                            }
                        ]
                    });
                });
            }

            res.json(parameters);
        });

        // FHIR $validate-code operation
        this.app.get('/CodeSystem/:id/$validate-code', async (req, res) => {
            await this.ensureInitialized();
            
            const { code, display, system } = req.query;
            
            if (!code) {
                return res.status(400).json({
                    resourceType: "OperationOutcome",
                    issue: [{
                        severity: "error",
                        code: "required",
                        diagnostics: "Parameter 'code' is required"
                    }]
                });
            }

            const isValid = this.namasteData.has(code) || this.tm2Data.has(code);
            
            res.json({
                resourceType: "Parameters",
                parameter: [
                    {
                        name: "result",
                        valueBoolean: isValid
                    },
                    {
                        name: "message",
                        valueString: isValid ? "Code validation successful" : `Code '${code}' not found in terminology`
                    }
                ]
            });
        });

        // FHIR $translate operation
        this.app.get('/ConceptMap/:id/$translate', async (req, res) => {
            await this.ensureInitialized();
            
            const { code, system, source, target } = req.query;
            
            if (!code) {
                return res.status(400).json({
                    resourceType: "OperationOutcome",
                    issue: [{
                        severity: "error",
                        code: "required",
                        diagnostics: "Parameter 'code' is required"
                    }]
                });
            }

            const mapping = this.mappingData.get(code);
            if (!mapping) {
                return res.json({
                    resourceType: "Parameters",
                    parameter: [
                        {
                            name: "result",
                            valueBoolean: false
                        },
                        {
                            name: "message",
                            valueString: `No mapping found for code '${code}'`
                        }
                    ]
                });
            }

            res.json({
                resourceType: "Parameters",
                parameter: [
                    {
                        name: "result",
                        valueBoolean: true
                    },
                    {
                        name: "match",
                        part: [
                            {
                                name: "equivalence",
                                valueCode: this.getEquivalenceLevel(mapping.confidence)
                            },
                            {
                                name: "concept",
                                valueCoding: {
                                    system: mapping.module === 'TM2' 
                                        ? "http://id.who.int/icd/entity/tm2"
                                        : "http://id.who.int/icd/entity/mms",
                                    code: mapping.icdCode,
                                    display: mapping.icdTitle
                                }
                            },
                            {
                                name: "source",
                                valueString: req.protocol + '://' + req.get('host') + '/ConceptMap/' + req.params.id
                            }
                        ]
                    }
                ]
            });
        });

        // Custom endpoints for AYUSH-specific operations
        
        // Search NAMASTE codes by system
        this.app.get('/namaste/search', async (req, res) => {
            await this.ensureInitialized();
            
            const { system, display, code } = req.query;
            
            let results = Array.from(this.namasteData.values());
            
            if (system) {
                results = results.filter(concept => 
                    concept.system.toLowerCase().includes(system.toLowerCase())
                );
            }
            
            if (display) {
                results = results.filter(concept =>
                    concept.display.toLowerCase().includes(display.toLowerCase()) ||
                    concept.synonyms.some(synonym => 
                        synonym.toLowerCase().includes(display.toLowerCase())
                    )
                );
            }
            
            if (code) {
                results = results.filter(concept => concept.code === code);
            }

            res.json({
                total: results.length,
                results: results.slice(0, 50) // Limit to 50 results
            });
        });

        // Get mappings for a NAMASTE code
        this.app.get('/namaste/:code/mappings', async (req, res) => {
            await this.ensureInitialized();
            
            const mapping = this.mappingData.get(req.params.code);
            if (!mapping) {
                return res.status(404).json({
                    error: "No mappings found for the specified code"
                });
            }

            res.json(mapping);
        });

        // Bulk validation endpoint
        this.app.post('/validate-codes', async (req, res) => {
            await this.ensureInitialized();
            
            const { codes } = req.body;
            
            if (!Array.isArray(codes)) {
                return res.status(400).json({
                    error: "Request body must contain 'codes' array"
                });
            }

            const results = codes.map(code => ({
                code,
                valid: this.namasteData.has(code) || this.tm2Data.has(code),
                system: this.namasteData.has(code) 
                    ? this.namasteData.get(code).system
                    : (this.tm2Data.has(code) ? 'TM2' : null)
            }));

            res.json({
                total: results.length,
                valid: results.filter(r => r.valid).length,
                invalid: results.filter(r => !r.valid).length,
                results
            });
        });

        // Statistics endpoint
        this.app.get('/stats', async (req, res) => {
            await this.ensureInitialized();
            
            const systemCounts = {};
            Array.from(this.namasteData.values()).forEach(concept => {
                systemCounts[concept.system] = (systemCounts[concept.system] || 0) + 1;
            });

            const mappingStats = {
                total: this.mappingData.size,
                byModule: {
                    MMS: Array.from(this.mappingData.values()).filter(m => m.module === 'MMS').length,
                    TM2: Array.from(this.mappingData.values()).filter(m => m.module === 'TM2').length
                },
                byConfidence: {
                    high: Array.from(this.mappingData.values()).filter(m => m.confidence >= 0.8).length,
                    moderate: Array.from(this.mappingData.values()).filter(m => m.confidence >= 0.6 && m.confidence < 0.8).length,
                    low: Array.from(this.mappingData.values()).filter(m => m.confidence < 0.6).length
                }
            };

            res.json({
                service: "NAMASTE-ICD11 Terminology Service",
                version: "1.0.0",
                initialized: this.isInitialized,
                codeSystems: {
                    total: this.codeSystemsCache.size,
                    namaste: {
                        total: this.namasteData.size,
                        bySystems: systemCounts
                    },
                    tm2: {
                        total: this.tm2Data.size
                    }
                },
                conceptMaps: {
                    total: this.conceptMapsCache.size
                },
                mappings: mappingStats
            });
        });

        // WHO ICD-11 API Integration Routes
        
        // WHO API health status
        this.app.get('/who/health', async (req, res) => {
            try {
                const status = await this.whoApiService.getHealthStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({
                    error: "Failed to check WHO API health",
                    details: error.message
                });
            }
        });

        // Get ICD-11 entity by code
        this.app.get('/who/icd11/:code', async (req, res) => {
            try {
                const entity = await this.whoApiService.getEntityByCode(req.params.code);
                if (!entity) {
                    return res.status(404).json({
                        error: "ICD-11 entity not found"
                    });
                }
                res.json(entity);
            } catch (error) {
                res.status(500).json({
                    error: "Failed to fetch ICD-11 entity",
                    details: error.message
                });
            }
        });

        // Search ICD-11 entities
        this.app.get('/who/search', async (req, res) => {
            try {
                const { q: query } = req.query;
                if (!query) {
                    return res.status(400).json({
                        error: "Query parameter 'q' is required"
                    });
                }

                const results = await this.whoApiService.searchEntities(query);
                res.json({
                    query,
                    total: results.length,
                    results
                });
            } catch (error) {
                res.status(500).json({
                    error: "Failed to search ICD-11 entities",
                    details: error.message
                });
            }
        });

        // Validate NAMASTE to ICD-11 mapping
        this.app.post('/who/validate-mapping', async (req, res) => {
            try {
                const { namasteCode, icdCode, namasteDisplay, icdTitle } = req.body;
                
                if (!namasteCode || !icdCode) {
                    return res.status(400).json({
                        error: "Both namasteCode and icdCode are required"
                    });
                }

                const validation = await this.whoApiService.validateMapping(
                    namasteCode, icdCode, namasteDisplay, icdTitle
                );
                
                res.json(validation);
            } catch (error) {
                res.status(500).json({
                    error: "Failed to validate mapping",
                    details: error.message
                });
            }
        });

        // Enhanced mapping with WHO validation
        this.app.get('/namaste/:code/mappings/validated', async (req, res) => {
            await this.ensureInitialized();
            
            try {
                const mapping = this.mappingData.get(req.params.code);
                if (!mapping) {
                    return res.status(404).json({
                        error: "No mappings found for the specified code"
                    });
                }

                // Get WHO validation for this mapping
                const whoValidation = await this.whoApiService.validateMapping(
                    mapping.namasteCode,
                    mapping.icdCode,
                    mapping.namasteDisplay,
                    mapping.icdTitle
                );

                res.json({
                    ...mapping,
                    whoValidation
                });
            } catch (error) {
                res.status(500).json({
                    error: "Failed to get validated mapping",
                    details: error.message
                });
            }
        });

        // Bulk validate all mappings
        this.app.get('/who/validate-all-mappings', async (req, res) => {
            await this.ensureInitialized();
            
            try {
                const mappings = Array.from(this.mappingData.values());
                const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Limit for performance
                const results = [];

                console.log(`🔍 Validating ${limit} mappings with WHO ICD-11 API...`);

                for (let i = 0; i < Math.min(mappings.length, limit); i++) {
                    const mapping = mappings[i];
                    try {
                        const validation = await this.whoApiService.validateMapping(
                            mapping.namasteCode,
                            mapping.icdCode,
                            mapping.namasteDisplay,
                            mapping.icdTitle
                        );

                        results.push({
                            ...mapping,
                            whoValidation: validation
                        });

                        // Small delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error(`Failed to validate ${mapping.namasteCode}:`, error.message);
                        results.push({
                            ...mapping,
                            whoValidation: {
                                isValid: false,
                                error: error.message
                            }
                        });
                    }
                }

                res.json({
                    total: results.length,
                    validated: results.filter(r => r.whoValidation.isValid).length,
                    results
                });
            } catch (error) {
                res.status(500).json({
                    error: "Failed to validate mappings",
                    details: error.message
                });
            }
        });
    }

    /**
     * Helper method to determine FHIR equivalence level
     */
    getEquivalenceLevel(confidence) {
        if (confidence >= 0.8) return "equivalent";
        else if (confidence >= 0.6) return "wider";
        else if (confidence >= 0.4) return "narrower";
        else return "unmatched";
    }

    /**
     * Ensure service is initialized
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Start the terminology service
     */
    async start(port = 3001) {
        await this.initialize();
        
        this.server = this.app.listen(port, () => {
            console.log(`🏥 NAMASTE Terminology Service running on port ${port}`);
            console.log(`📋 Health check: http://localhost:${port}/health`);
            console.log(`📖 Metadata: http://localhost:${port}/metadata`);
            console.log(`🔍 Search NAMASTE: http://localhost:${port}/namaste/search`);
            console.log(`📊 Statistics: http://localhost:${port}/stats`);
        });

        return this.server;
    }

    /**
     * Stop the terminology service  
     */
    async stop() {
        if (this.server) {
            this.server.close();
            console.log('🛑 Terminology Service stopped');
        }
    }
}

module.exports = TerminologyMicroService;