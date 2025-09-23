import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Globe, Code, Database, Search, Activity, Shield, Zap } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const apiCategories = {
  fhir: {
    title: "🏆 FHIR R4 Terminology Service (Port 3001)",
    description: "Production-ready FHIR-compliant terminology microservice for NAMASTE-ICD11 dual coding",
    apis: [
      {
        name: "Service Health Check",
        method: "GET",
        url: "http://localhost:3001/health",
        description: "Check if the FHIR terminology service is running and healthy"
      },
      {
        name: "Service Statistics",
        method: "GET", 
        url: "http://localhost:3001/stats",
        description: "Get comprehensive statistics about CodeSystems, ConceptMaps, and mapping confidence"
      },
      {
        name: "FHIR CodeSystems",
        method: "GET",
        url: "http://localhost:3001/CodeSystem",
        description: "Retrieve all FHIR R4 CodeSystem resources (NAMASTE + TM2)"
      },
      {
        name: "Specific CodeSystem",
        method: "GET",
        url: "http://localhost:3001/CodeSystem/{id}",
        description: "Get a specific CodeSystem by ID (e.g., namaste-ayurveda, namaste-unani)"
      },
      {
        name: "FHIR ConceptMaps",
        method: "GET",
        url: "http://localhost:3001/ConceptMap",
        description: "Retrieve all ConceptMap resources for dual-coding mappings"
      },
      {
        name: "Code Validation",
        method: "GET",
        url: "http://localhost:3001/CodeSystem/$validate-code",
        description: "FHIR operation to validate if a code exists in a CodeSystem"
      },
      {
        name: "Code Lookup",
        method: "GET",
        url: "http://localhost:3001/CodeSystem/$lookup",
        description: "FHIR operation to lookup concept details by code"
      },
      {
        name: "Concept Translation",
        method: "GET",
        url: "http://localhost:3001/ConceptMap/$translate",
        description: "FHIR operation to translate concepts between NAMASTE and ICD-11"
      }
    ]
  },
  who: {
    title: "🌍 WHO ICD-11 API Integration (Port 3001)",
    description: "Real-time integration with official WHO ICD-11 API for validation and enhanced mapping",
    apis: [
      {
        name: "WHO API Health Check",
        method: "GET",
        url: "http://localhost:3001/who/health",
        description: "Check authentication status and connection to WHO ICD-11 API"
      },
      {
        name: "Get ICD-11 Entity",
        method: "GET",
        url: "http://localhost:3001/who/icd11/{code}",
        description: "Fetch official ICD-11 entity details by code from WHO API"
      },
      {
        name: "Search ICD-11 Entities",
        method: "GET",
        url: "http://localhost:3001/who/search?q={query}",
        description: "Search official ICD-11 terminology using WHO API"
      },
      {
        name: "Validate Mapping",
        method: "POST",
        url: "http://localhost:3001/who/validate-mapping",
        description: "Validate NAMASTE-ICD11 mappings against official WHO data"
      },
      {
        name: "Enhanced Mapping",
        method: "GET",
        url: "http://localhost:3001/namaste/{code}/mappings/validated",
        description: "Get NAMASTE mappings with WHO API validation results"
      },
      {
        name: "Bulk Validation",
        method: "GET",
        url: "http://localhost:3001/who/validate-all-mappings?limit=10",
        description: "Validate multiple mappings against WHO ICD-11 API (performance optimized)"
      }
    ]
  },
  namaste: {
    title: "🌿 NAMASTE Search & Mapping APIs (Port 3001)",
    description: "Advanced search and mapping operations for traditional medicine concepts",
    apis: [
      {
        name: "Search NAMASTE Concepts",
        method: "GET",
        url: "http://localhost:3001/namaste/search?display={term}&limit=10",
        description: "Semantic search across all NAMASTE concepts with fuzzy matching"
      },
      {
        name: "Get Concept Mappings",
        method: "GET",
        url: "http://localhost:3001/namaste/{code}/mappings",
        description: "Get detailed ICD-11 mappings for a specific NAMASTE code"
      },
      {
        name: "System-specific Search",
        method: "GET",
        url: "http://localhost:3001/namaste/search?system=ayurveda&display={term}",
        description: "Search within specific AYUSH systems (ayurveda, unani, siddha, etc.)"
      }
    ]
  },
  main: {
    title: "🏥 Main Application APIs (Port 3000)",
    description: "Core application functionality for authentication and patient management",
    apis: [
      {
        name: "User Registration",
        method: "POST",
        url: "http://localhost:3000/api/auth/register",
        description: "Register new users with email validation and role assignment"
      },
      {
        name: "User Authentication",
        method: "POST",
        url: "http://localhost:3000/api/auth/login",
        description: "Authenticate users and generate JWT tokens"
      },
      {
        name: "Patient Records",
        method: "GET",
        url: "http://localhost:3000/api/patient/records",
        description: "Retrieve patient medical records with dual-coding support"
      },
      {
        name: "Create Medical Record",
        method: "POST",
        url: "http://localhost:3000/api/patient/records",
        description: "Create new medical records with NAMASTE-ICD11 dual coding"
      },
      {
        name: "Search Integration",
        method: "GET",
        url: "http://localhost:3000/api/search/integrated",
        description: "Integrated search across patients, conditions, and terminology"
      }
    ]
  }
};

export default function ApiDocs() {
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Copied: " + url);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-700 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fhir': return <Shield className="w-8 h-8 text-primary-foreground" />;
      case 'namaste': return <Search className="w-8 h-8 text-primary-foreground" />;
      case 'who': return <Globe className="w-8 h-8 text-primary-foreground" />;
      case 'main': return <Database className="w-8 h-8 text-primary-foreground" />;
      default: return <Globe className="w-8 h-8 text-primary-foreground" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-background/80">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 w-full"
        >
          <Badge className="px-6 py-3 bg-primary/10 text-primary border-primary/20 mb-6 text-sm font-medium">
            🏆 SIH 2025 Challenge 25026 - REST API Documentation
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent mb-6 leading-tight">
            NAMASTE FHIR API Collection
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Production-ready REST API documentation for our <strong>FHIR R4-compliant</strong> terminology microservice. 
            <br className="hidden md:block" />
            <strong>15+ endpoints</strong> supporting standard FHIR operations and <strong>NAMASTE-ICD11 dual coding</strong>.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              FHIR R4 Compliant
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Database className="w-4 h-4 mr-2" />
              15+ Endpoints
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Production Ready
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              Live Service
            </Badge>
          </div>
        </motion.div>

        {/* API Categories */}
        <div className="space-y-12 w-full">
          {Object.entries(apiCategories).map(([categoryKey, category], categoryIdx) => (
            <motion.div
              key={categoryKey}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIdx * 0.2 }}
            >
              <Card className="overflow-hidden shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-accent/5 border-b border-border/50 text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      {getCategoryIcon(categoryKey)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold mb-3">{category.title}</CardTitle>
                      <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <div className="grid gap-6">
                    {category.apis.map((api, apiIdx) => (
                      <motion.div
                        key={apiIdx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: (categoryIdx * 0.2) + (apiIdx * 0.1) }}
                        className="border border-border/50 rounded-xl p-6 hover:bg-accent/5 hover:border-primary/20 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="space-y-4">
                          {/* API Header */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <Badge className={`text-sm font-semibold px-3 py-1 ${getMethodColor(api.method)}`}>
                                {api.method}
                              </Badge>
                              <h3 className="text-xl font-bold text-foreground">{api.name}</h3>
                            </div>
                          </div>
                          
                          {/* API Description */}
                          <p className="text-muted-foreground text-base leading-relaxed">{api.description}</p>
                          
                          {/* API URL */}
                          <div className="bg-muted/30 border border-border/30 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <Code className="w-5 h-5 text-primary flex-shrink-0" />
                              <code className="text-sm font-mono flex-1 text-foreground break-all">
                                {api.url}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(api.url)}
                                className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                title="Copy URL"
                              >
                                <Copy className="w-4 h-4" />
                                <span className="hidden sm:inline">Copy</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 w-full max-w-5xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 border-primary/20 shadow-xl">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                🚀 Quick Start Guide
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Launch both microservices to access the complete API ecosystem and experience 
                the full power of NAMASTE-ICD11 dual coding system.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <div className="bg-background/60 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xl font-bold">Main Backend</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <code className="text-sm font-mono text-foreground">node index.js</code>
                  </div>
                  <Badge variant="outline" className="text-sm">Port 3000</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Authentication & Patient Management</p>
                </div>
                
                <div className="bg-background/60 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold">FHIR Service</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <code className="text-sm font-mono text-foreground">node launch-terminology.js</code>
                  </div>
                  <Badge variant="outline" className="text-sm">Port 3001</Badge>
                  <p className="text-sm text-muted-foreground mt-2">FHIR Terminology & Dual Coding</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Pro Tip:</strong> Use the interactive demo at 
                  <code className="mx-1 px-2 py-1 bg-muted rounded text-primary">/terminology</code> 
                  to test APIs in real-time
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
