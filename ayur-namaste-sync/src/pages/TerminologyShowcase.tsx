import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Globe, 
  Code, 
  Database, 
  Search, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Zap,
  BookOpen,
  Network,
  Layers
} from "lucide-react";
import axios from "axios";

interface FHIRResource {
  resourceType: string;
  id: string;
  url: string;
  title: string;
  count?: number;
  concept?: any[];
}

interface TerminologyStats {
  codeSystems: {
    total: number;
    namaste: {
      total: number;
      bySystems: Record<string, number>;
    };
    tm2: {
      total: number;
    };
  };
  conceptMaps: {
    total: number;
  };
  mappings: {
    total: number;
    byModule: {
      MMS: number;
      TM2: number;
    };
    byConfidence: {
      high: number;
      moderate: number;
      low: number;
    };
  };
}

export default function TerminologyShowcase() {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [stats, setStats] = useState<TerminologyStats | null>(null);
  const [codeSystems, setCodeSystems] = useState<FHIRResource[]>([]);
  const [conceptMaps, setConceptMaps] = useState<FHIRResource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const TERMINOLOGY_SERVICE_URL = "http://localhost:3001";

  // Check if terminology service is running
  const checkServiceStatus = async () => {
    try {
      const response = await axios.get(`${TERMINOLOGY_SERVICE_URL}/health`);
      setIsServiceRunning(response.data.status === 'healthy');
      return true;
    } catch (error) {
      setIsServiceRunning(false);
      return false;
    }
  };

  // Load terminology data
  const loadTerminologyData = async () => {
    try {
      setIsLoading(true);
      
      // Load statistics
      const statsResponse = await axios.get(`${TERMINOLOGY_SERVICE_URL}/stats`);
      setStats(statsResponse.data);

      // Load CodeSystems
      const codeSystemsResponse = await axios.get(`${TERMINOLOGY_SERVICE_URL}/CodeSystem`);
      setCodeSystems(codeSystemsResponse.data.entry.map((entry: any) => entry.resource));

      // Load ConceptMaps
      const conceptMapsResponse = await axios.get(`${TERMINOLOGY_SERVICE_URL}/ConceptMap`);
      setConceptMaps(conceptMapsResponse.data.entry.map((entry: any) => entry.resource));

    } catch (error) {
      console.error('Failed to load terminology data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search NAMASTE concepts
  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${TERMINOLOGY_SERVICE_URL}/namaste/search`, {
        params: { display: term, limit: 10 }
      });
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  // Get concept mappings
  const getConceptMappings = async (code: string) => {
    try {
      const response = await axios.get(`${TERMINOLOGY_SERVICE_URL}/namaste/${code}/mappings`);
      setSelectedConcept(response.data);
    } catch (error) {
      console.error('Failed to get mappings:', error);
      setSelectedConcept(null);
    }
  };

  useEffect(() => {
    const initializeShowcase = async () => {
      const serviceRunning = await checkServiceStatus();
      if (serviceRunning) {
        await loadTerminologyData();
      }
    };

    initializeShowcase();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-background to-background/80">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <Badge className="px-4 py-2 bg-primary/10 text-primary border-primary/20">
              🏆 SIH 2025 - Challenge 25026
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              NAMASTE FHIR Terminology System
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              A complete FHIR R4-compliant terminology infrastructure bridging traditional AYUSH medicine 
              with international healthcare standards. <strong>150 concepts</strong> standardized across 
              <strong>3 AYUSH systems</strong> with <strong>bidirectional ICD-11 mapping</strong>.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                FHIR R4 Compliant
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                WHO ICD-11 Compatible
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Database className="w-4 h-4 mr-2" />
                India EHR Standards 2016
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className={`max-w-2xl mx-auto ${isServiceRunning ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isServiceRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <h3 className="font-semibold">
                      Terminology Service Status: {isServiceRunning ? 'Running' : 'Offline'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isServiceRunning 
                        ? 'FHIR terminology service is active on port 3001' 
                        : 'Please start the service: cd Backend && node launch-terminology.js'
                      }
                    </p>
                  </div>
                </div>
                
                {isServiceRunning && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadTerminologyData}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {isServiceRunning && stats && (
        <>
          {/* Statistics Overview */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">System Overview</h2>
                <p className="text-muted-foreground">Real-time statistics from our FHIR terminology service</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stats.codeSystems.total}
                    </div>
                    <div className="text-sm text-muted-foreground">FHIR CodeSystems</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Network className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-3xl font-bold text-accent mb-2">
                      {stats.conceptMaps.total}
                    </div>
                    <div className="text-sm text-muted-foreground">ConceptMaps</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-6 h-6 text-success" />
                    </div>
                    <div className="text-3xl font-bold text-success mb-2">
                      {stats.codeSystems.namaste.total}
                    </div>
                    <div className="text-sm text-muted-foreground">NAMASTE Concepts</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <ArrowRight className="w-6 h-6 text-warning" />
                    </div>
                    <div className="text-3xl font-bold text-warning mb-2">
                      {stats.mappings.total}
                    </div>
                    <div className="text-sm text-muted-foreground">ICD-11 Mappings</div>
                  </CardContent>
                </Card>
              </div>

              {/* AYUSH Systems Distribution */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-center mb-8">AYUSH Systems Coverage</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(stats.codeSystems.namaste.bySystems).map(([system, count]) => (
                    <Card key={system} className="text-center">
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold text-primary mb-2">{count}</div>
                        <div className="text-lg font-medium mb-2">{system}</div>
                        <div className="text-sm text-muted-foreground">Traditional Medicine Concepts</div>
                        <div className="mt-4 w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(count / stats.codeSystems.namaste.total) * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Mapping Quality */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-center mb-8">Mapping Quality Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center border-green-200">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {stats.mappings.byConfidence.high}
                      </div>
                      <div className="text-lg font-medium mb-2">High Confidence</div>
                      <div className="text-sm text-muted-foreground">≥80% accuracy</div>
                      <Badge className="mt-2 bg-green-100 text-green-700">Excellent</Badge>
                    </CardContent>
                  </Card>

                  <Card className="text-center border-yellow-200">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">
                        {stats.mappings.byConfidence.moderate}
                      </div>
                      <div className="text-lg font-medium mb-2">Moderate Confidence</div>
                      <div className="text-sm text-muted-foreground">60-80% accuracy</div>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-700">Good</Badge>
                    </CardContent>
                  </Card>

                  <Card className="text-center border-orange-200">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {stats.mappings.byConfidence.low}
                      </div>
                      <div className="text-lg font-medium mb-2">Lower Confidence</div>
                      <div className="text-sm text-muted-foreground">&lt;60% accuracy</div>
                      <Badge className="mt-2 bg-orange-100 text-orange-700">Fair</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Demo */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Interactive Terminology Search</h2>
                <p className="text-muted-foreground">
                  Try searching for medical conditions to see the dual-coding system in action
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="search" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="search">🔍 Search Demo</TabsTrigger>
                    <TabsTrigger value="codesystems">📚 CodeSystems</TabsTrigger>
                    <TabsTrigger value="conceptmaps">🗺️ ConceptMaps</TabsTrigger>
                  </TabsList>

                  {/* Search Tab */}
                  <TabsContent value="search" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Search className="w-5 h-5" />
                          NAMASTE Terminology Search
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search for conditions (e.g., diabetes, asthma, headache)..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              handleSearch(e.target.value);
                            }}
                            className="flex-1"
                          />
                          <Button onClick={() => handleSearch(searchTerm)}>
                            Search
                          </Button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Search Results:</h4>
                            <div className="grid gap-2 max-h-60 overflow-y-auto">
                              {searchResults.map((result) => (
                                <Card 
                                  key={result.code} 
                                  className="cursor-pointer hover:bg-accent/5 transition-colors"
                                  onClick={() => getConceptMappings(result.code)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium">{result.display}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                          <Badge variant="outline">{result.code}</Badge>
                                          <span>•</span>
                                          <span>{result.system} System</span>
                                        </div>
                                      </div>
                                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Selected Concept Mapping */}
                        {selectedConcept && (
                          <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                              <CardTitle className="text-lg">Dual-Coding Mapping</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* NAMASTE Layer */}
                              <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                    <span className="text-secondary-foreground text-xs font-bold">1</span>
                                  </div>
                                  <h5 className="font-semibold">NAMASTE (Traditional)</h5>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium">{selectedConcept.namasteDisplay}</p>
                                  <Badge variant="secondary">{selectedConcept.namasteCode}</Badge>
                                </div>
                              </div>

                              {/* Arrow */}
                              <div className="flex justify-center">
                                <ArrowRight className="w-6 h-6 text-primary" />
                              </div>

                              {/* ICD-11 Layer */}
                              <div className="p-4 bg-primary/20 rounded-lg border border-primary/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">2</span>
                                  </div>
                                  <h5 className="font-semibold">ICD-11 (International)</h5>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium">{selectedConcept.icdTitle}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="default">{selectedConcept.icdCode}</Badge>
                                    <Badge 
                                      variant="outline"
                                      className={
                                        selectedConcept.confidence >= 0.8 ? 'border-green-500 text-green-700' :
                                        selectedConcept.confidence >= 0.6 ? 'border-yellow-500 text-yellow-700' :
                                        'border-red-500 text-red-700'
                                      }
                                    >
                                      {Math.round(selectedConcept.confidence * 100)}% confidence
                                    </Badge>
                                    <Badge variant="outline">{selectedConcept.module}</Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* CodeSystems Tab */}
                  <TabsContent value="codesystems" className="space-y-4">
                    <div className="grid gap-4">
                      {codeSystems.map((codeSystem) => (
                        <Card key={codeSystem.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold">{codeSystem.title}</h3>
                                <p className="text-sm text-muted-foreground">ID: {codeSystem.id}</p>
                                <Badge variant="outline">{codeSystem.count} concepts</Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(`${TERMINOLOGY_SERVICE_URL}/CodeSystem/${codeSystem.id}`, '_blank')}
                                >
                                  <Code className="w-4 h-4 mr-2" />
                                  View JSON
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* ConceptMaps Tab */}
                  <TabsContent value="conceptmaps" className="space-y-4">
                    <div className="grid gap-4">
                      {conceptMaps.map((conceptMap) => (
                        <Card key={conceptMap.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold">{conceptMap.title}</h3>
                                <p className="text-sm text-muted-foreground">ID: {conceptMap.id}</p>
                                <div className="flex gap-2">
                                  <Badge variant="outline">Bidirectional Mapping</Badge>
                                  <Badge variant="secondary">FHIR R4</Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(`${TERMINOLOGY_SERVICE_URL}/ConceptMap/${conceptMap.id}`, '_blank')}
                                >
                                  <Network className="w-4 h-4 mr-2" />
                                  View JSON
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>

          {/* Technical Features */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Technical Implementation</h2>
                <p className="text-muted-foreground">
                  Built with industry standards and best practices
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">FHIR R4 Compliance</h3>
                    <p className="text-muted-foreground">
                      Complete implementation of FHIR R4 CodeSystem and ConceptMap resources 
                      with proper metadata and structure
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-green-100 text-green-700">✓ CodeSystem</Badge>
                      <Badge className="bg-green-100 text-green-700">✓ ConceptMap</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">RESTful API</h3>
                    <p className="text-muted-foreground">
                      15+ endpoints supporting standard FHIR operations including 
                      $lookup, $validate-code, and $translate
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700">15+ Endpoints</Badge>
                      <Badge className="bg-blue-100 text-blue-700">REST API</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                      <Activity className="w-6 h-6 text-success" />
                    </div>
                    <h3 className="text-xl font-semibold">Live Service</h3>
                    <p className="text-muted-foreground">
                      Production-ready microservice with health monitoring, 
                      caching, and real-time statistics
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-green-100 text-green-700">
                        {isServiceRunning ? '🟢 Online' : '🔴 Offline'}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700">Port 3001</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the complete NAMASTE FHIR terminology system in action through our 
            interactive doctor dashboard
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <a href="/login">
                Try Doctor Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <a href="/docs">
                View Documentation
                <BookOpen className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}