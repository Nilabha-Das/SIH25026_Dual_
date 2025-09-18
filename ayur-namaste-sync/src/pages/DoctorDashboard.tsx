"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Layout } from "@/components/Layout";
import { AppSidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchBar } from "@/components/SearchBar";
import { DualCodePreview } from "@/components/DualCodePreview";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, UserPlus, TrendingUp, Search } from "lucide-react";
import { User } from "@/lib/mockData";

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Problem {
  _id: string;
  namasteCode: string;
  namasteTerm: string;
  icdCode: string;
  icdTerm: string;
  confidence: number;
  status?: string;
}

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === query.toLowerCase() ? 
      <span key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> : 
      part
  );
};

interface NAMASTESearchResult {
  code: string;
  display: string;
  system: string;
  synonyms?: string;
  icdMappings: Array<{
    code: string;
    confidence: number;
    module: "MMS" | "TM2";
    title: string;
  }>;
}

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [abhaId, setAbhaId] = useState("");
  const [selectedNAMASTE, setSelectedNAMASTE] = useState<NAMASTESearchResult | null>(null);
  const [problemInput, setProblemInput] = useState("");
  const [problemList, setProblemList] = useState<Problem[]>([]);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [searchResults, setSearchResults] = useState<NAMASTESearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientData, setPatientData] = useState<any>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Search function using mapping API
  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for term:', term);
      
      // First, get NAMASTE codes that match the search term
      const namasteResponse = await axios.get(`http://localhost:3000/api/namaste`, {
        params: { 
          term,
          limit: 10 // Limit results to top 10 matches
        }
      });
      console.log('NAMASTE Response:', namasteResponse.data);
      
      // Sort results by relevance
      const sortedResults = namasteResponse.data.sort((a: any, b: any) => {
        const aStartsWith = a.display.toLowerCase().startsWith(term.toLowerCase());
        const bStartsWith = b.display.toLowerCase().startsWith(term.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // If neither or both start with the term, sort alphabetically
        return a.display.localeCompare(b.display);
      });

      if (!sortedResults || sortedResults.length === 0) {
        console.log('No NAMASTE codes found');
        setSearchResults([]);
        return;
      }

      // For each NAMASTE code, get its mappings
      const results = await Promise.all(
        sortedResults.map(async (namaste: any) => {
          console.log('Getting mappings for NAMASTE code:', namaste.code);
          const mappingResponse = await axios.get(
            `http://localhost:3000/api/mapping/namaste/${namaste.code}`
          );
          console.log('Mapping Response for', namaste.code, ':', mappingResponse.data);

          // Format the mappings into the expected structure
          const icdMappings = mappingResponse.data.map((mapping: any) => {
            console.log('Processing mapping with details:', mapping);
            return {
              code: mapping.icdCode || mapping.icd_code,
              confidence: mapping.confidence || 0,
              module: mapping.module || "MMS",
              title: mapping.icdDetails?.title || mapping.icdTitle || mapping.icd_title || "Unknown ICD Title"
            };
          });

          return {
            code: namaste.code,
            display: namaste.display,
            system: namaste.system,
            synonyms: namaste.synonyms,
            icdMappings
          };
        })
      );

      console.log('Final formatted results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  // --- Add Problem ---
  const handleAddProblem = () => {
    if (!selectedNAMASTE) return;

    // Find the best mapping (prefer TM2 with highest confidence)
    const tm2Mappings = selectedNAMASTE.icdMappings.filter(m => m.module === "TM2");
    const mmsMappings = selectedNAMASTE.icdMappings.filter(m => m.module === "MMS");
    
    const bestMapping = tm2Mappings.length > 0
      ? tm2Mappings.reduce((prev, curr) => curr.confidence > prev.confidence ? curr : prev)
      : mmsMappings[0];

    const newProblem: Problem = {
      _id: Date.now().toString(),
      namasteCode: selectedNAMASTE.code,
      namasteTerm: selectedNAMASTE.display,
      icdCode: bestMapping?.code || "N/A",
      icdTerm: bestMapping?.title || "No ICD Mapping",
      confidence: bestMapping?.confidence ?? 0,
      status: "active",
    };

    setProblemList((prev) => [...prev, newProblem]);
    setProblemInput("");
    setSelectedNAMASTE(null);
    setSearchResults([]);
  };

  // --- Submit Prescription ---
  const handleSubmitPrescription = async () => {
    if (!patientData) {
      alert("Please load patient data first");
      return;
    }

    if (problemList.length === 0) {
      alert("Please add at least one problem");
      return;
    }

    if (!user || !user.id) {
      alert("Doctor information is missing. Please log in again.");
      return;
    }

    console.log('Submitting prescription with doctor info:', {
      doctorId: user.id,
      doctorName: user.name,
      doctorRole: user.role
    });

    try {
      // Save each problem as a medical record
      for (const problem of problemList) {
        const prescriptionData = {
          doctorId: user._id || user.id, // Use MongoDB _id if available
          namasteCode: problem.namasteCode,
          namasteTerm: problem.namasteTerm,
          icdCode: problem.icdCode,
          icdTerm: problem.icdTerm,
          prescription: prescriptionText
        };
        
        console.log('Submitting medical record:', {
          abhaId,
          prescriptionData
        });

        // Submit medical record
        await axios.post(`http://localhost:3000/api/patient/${abhaId}/records`, prescriptionData);
      }

      // Create FHIR bundle
      await axios.post("http://localhost:3000/fhir/bundle", {
        patientId: abhaId,
        problems: problemList,
        prescription: prescriptionText,
      });

      // Refresh patient data
      const response = await axios.get(`http://localhost:3000/api/patient/${abhaId}`);
      setPatientData(response.data);

      alert("✅ Prescription submitted!");
      setPrescriptionText("");
      setProblemList([]);
    } catch (err: any) {
      console.error("❌ Error submitting prescription:", err);
      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
      alert(`Error submitting prescription: ${errorMessage}`);
    }
  };

  // Log component state on each render
  console.log('DoctorDashboard render state:', {
    selectedNAMASTE,
    searchResults,
    isSearching
  });

  return (
    <Layout>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Sidebar */}
          <AppSidebar userRole="doctor" />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <TopBar user={user} onLogout={onLogout} />

            <main className="h-[calc(100vh-64px)] overflow-y-auto">
              <div className="max-w-screen-2xl w-full mx-auto px-6 py-6 space-y-6">
                {/* Patient Info Card */}
                {patientData && (
                  <Card className="w-full">
                    <CardHeader className="pb-4">
                      <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Personal Details</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {patientData.name}</p>
                            <p><strong>ABHA ID:</strong> {patientData.abhaId}</p>
                            <p><strong>Email:</strong> {patientData.email}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Medical History</h3>
                          <div className="space-y-2">
                            {patientData.medicalRecords?.length > 0 ? (
                              patientData.medicalRecords.map((record: any, index: number) => (
                                <div key={index} className="text-sm p-2 border rounded">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                                      <p><strong>Problem:</strong> {record.namasteTerm}</p>
                                      <p><strong>ICD:</strong> {record.icdTerm}</p>
                                    </div>
                                    <Badge variant={
                                      record.approvalStatus === 'approved' ? 'default' :
                                      record.approvalStatus === 'rejected' ? 'destructive' :
                                      'secondary'
                                    }>
                                      {record.approvalStatus}
                                    </Badge>
                                  </div>
                                  {record.approvalStatus === 'pending' && (
                                    <p className="text-sm text-muted-foreground italic">
                                      Awaiting curator approval
                                    </p>
                                  )}
                                  {record.curatorNotes && (
                                    <p className="text-sm mt-2 p-2 bg-muted rounded">
                                      <strong>Curator Notes:</strong> {record.curatorNotes}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No medical history available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* --- Stats --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <Card className="w-full">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">24</p>
                        <p className="text-muted-foreground">Active Patients</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-muted-foreground">New This Week</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">92%</p>
                        <p className="text-muted-foreground">Mapping Accuracy</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* --- Search & Preview --- */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left: Search Panel */}
                  <Card className="h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-primary" />
                        NAMASTE Term Search
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col space-y-6 overflow-y-auto">
                      {/* ABHA ID */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter ABHA ID"
                          value={abhaId}
                          onChange={(e) => setAbhaId(e.target.value)}
                        />
                        <Button 
                          onClick={async () => {
                            if (!abhaId.trim()) {
                              alert("Please enter an ABHA ID");
                              return;
                            }
                            setIsLoadingPatient(true);
                            try {
                              console.log('Fetching patient data for ABHA ID:', abhaId);
                              const response = await axios.get(`http://localhost:3000/api/patient/${abhaId}`);
                              console.log('Patient data received:', response.data);
                              setPatientData(response.data);
                            } catch (error: any) {
                              console.error('Error loading patient:', error);
                              if (error.response?.status === 404) {
                                alert('Patient not found. Please check the ABHA ID.');
                              } else {
                                alert('Error loading patient: ' + (error.response?.data?.message || error.message));
                              }
                            } finally {
                              setIsLoadingPatient(false);
                            }
                          }}
                          disabled={isLoadingPatient}
                        >
                          {isLoadingPatient ? 'Loading...' : 'Load Patient'}
                        </Button>
                      </div>

                      {/* Search Input */}
                      <div className="space-y-4">
                        <Input
                          placeholder="Search diseases..."
                          value={searchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm(value);
                            if (value.length >= 2) {
                              // Add slight delay for better UX
                              setIsSearching(true);
                              const timeoutId = setTimeout(() => {
                                handleSearch(value.trim());
                              }, 300);
                              return () => clearTimeout(timeoutId);
                            } else {
                              setSearchResults([]);
                              setIsSearching(false);
                            }
                          }}
                          className="w-full"
                        />
                        
                        {isSearching ? (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            Searching...
                          </div>
                        ) : searchResults.length > 0 && (
                          <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                            {searchResults.map((result) => (
                              <button
                                key={result.code}
                                onClick={() => {
                                  console.log('Selected NAMASTE result:', result);
                                  setSelectedNAMASTE(result);
                                  setProblemInput(result.display);
                                  setSearchResults([]);
                                  setSearchTerm(result.display);  // Update search input with selected term
                                  setIsSearching(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                              >
                                <div className="font-medium">
                                  {highlightMatch(result.display, searchTerm)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {result.code} • {result.icdMappings.length} ICD mappings
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Dual Code Preview + Problems */}
                  <div className="flex flex-col gap-6 h-full">
                    {selectedNAMASTE && (
                      <Card className="shadow-md w-full">
                        <DualCodePreview
                          namasteCode={{
                            code: selectedNAMASTE.code,
                            display: selectedNAMASTE.display,
                            system: "NAMASTE",
                            synonyms: selectedNAMASTE.synonyms || "",
                          }}
                          icdMappings={
                            Array.isArray(selectedNAMASTE.icdMappings) && selectedNAMASTE.icdMappings.length > 0 
                              ? selectedNAMASTE.icdMappings.map(mapping => {
                                  console.log('Processing mapping for preview:', mapping);
                                  return {
                                    icdCode: {
                                      code: mapping.code,
                                      title: mapping.title || 'Unknown Title',
                                      module: mapping.module as "MMS" | "TM2",
                                      system: "http://id.who.int/icd/entity"
                                    },
                                    confidence: typeof mapping.confidence === 'number' ? mapping.confidence : 0,
                                    module: mapping.module as "MMS" | "TM2"
                                  };
                                })
                              : []
                          }
                        />
                      </Card>
                    )}

                    <Card className="flex-1 flex flex-col shadow-md">
                      <CardHeader>
                        <CardTitle>Add Problems & Prescription</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col space-y-6 overflow-y-auto p-6">
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-2">Add Problem</p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Type problem..."
                                value={problemInput}
                                onChange={(e) => setProblemInput(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                onClick={handleAddProblem}
                                className="shrink-0"
                              >
                                Add Problem
                              </Button>
                            </div>
                          </div>

                          {/* Problem List */}
                          <div className="flex-1">
                            <p className="font-medium mb-3">Current Problem List</p>
                            {problemList.length === 0 ? (
                              <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                                No problems added yet
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {problemList.map((p) => (
                                  <li
                                    key={p._id}
                                    className="p-3 border rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors"
                                  >
                                    <div>
                                      <strong>{p.namasteTerm}</strong>
                                      <div className="text-sm text-muted-foreground">
                                        NAMASTE: {p.namasteCode} | ICD: {p.icdCode}
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="ml-2">
                                      {p.status ?? "active"}
                                    </Badge>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Prescription */}
                        <div className="space-y-3">
                          <p className="font-medium">Prescription / Notes</p>
                          <Textarea
                            rows={6}
                            value={prescriptionText}
                            onChange={(e) => setPrescriptionText(e.target.value)}
                            placeholder="Enter prescription details here..."
                            className="resize-none"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={handleSubmitPrescription}
                            size="lg"
                            className="bg-success hover:bg-success/90 text-white"
                          >
                            Submit Prescription
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setPrescriptionText("")}
                          >
                            Clear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
}
