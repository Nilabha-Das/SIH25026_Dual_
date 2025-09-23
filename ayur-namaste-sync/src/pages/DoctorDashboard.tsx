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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Stethoscope, UserPlus, TrendingUp, Search, X, AlertCircle, Eye, Edit3, Trash2, Save, XCircle } from "lucide-react";
import { User } from "@/lib/mockData";
import { searchWithThreeLayer, TM2SearchResult, getTM2Statistics } from "@/lib/tm2Api";

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
  // Three-layer fields
  tm2Code?: string;
  tm2Title?: string;
  tm2Confidence?: number;
  traditionalSystem?: string;
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
  // Three-layer mappings
  tm2Mappings?: Array<{
    tm2Code: string;
    tm2Title: string;
    tm2Confidence: number;
    traditionalSystem: string;
    icdCode: string;
    icdTitle: string;
    icdConfidence: number;
    overallConfidence: number;
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
  const [isSubmittingPrescription, setIsSubmittingPrescription] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Edit/Delete states
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingRecord, setIsDeletingRecord] = useState<string | null>(null);
  
  // Three-layer architecture states
  const [useThreeLayer, setUseThreeLayer] = useState(true);
  const [tm2Stats, setTM2Stats] = useState<any>(null);

  // Validation functions
  const validateAbhaId = (id: string): boolean => {
    // ABHA ID format: ABHA-XXXX-XXXX (14 characters total)
    const abhaPattern = /^ABHA-\d{4}-\d{4}$/;
    return abhaPattern.test(id);
  };

  const validatePrescriptionForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validate ABHA ID
    if (!abhaId.trim()) {
      errors.abhaId = "ABHA ID is required";
    } else if (!validateAbhaId(abhaId.trim())) {
      errors.abhaId = "ABHA ID must be in format: ABHA-XXXX-XXXX";
    }

    // Validate patient is loaded
    if (!patientData) {
      errors.patient = "Please load patient data first";
    }

    // Validate problems
    if (problemList.length === 0) {
      errors.problems = "Please add at least one problem";
    }

    // Validate prescription text
    if (!prescriptionText.trim()) {
      errors.prescription = "Prescription details are required";
    } else if (prescriptionText.trim().length < 10) {
      errors.prescription = "Prescription must be at least 10 characters long";
    }

    // Validate user/doctor info
    if (!user || !user.id) {
      errors.doctor = "Doctor information is missing. Please log in again";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFormErrors = () => {
    setFormErrors({});
  };

  const clearForm = () => {
    setPrescriptionText("");
    setProblemList([]);
    setSelectedNAMASTE(null);
    setProblemInput("");
    setSearchTerm("");
    setSearchResults([]);
    clearFormErrors();
  };

  // Remove problem from list
  const handleRemoveProblem = (problemId: string) => {
    setProblemList(prev => prev.filter(p => p._id !== problemId));
  };

  // Search function using three-layer architecture
  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('🔍 Searching with three-layer architecture for term:', term);
      
      if (useThreeLayer) {
        try {
          // Use three-layer search API
          const threeLayerResults = await searchWithThreeLayer(term, 10);
          console.log('🩺 Three-layer search results:', threeLayerResults);
          
          if (threeLayerResults && threeLayerResults.length > 0) {
            // Convert to compatible format
            const results = threeLayerResults.map((result: TM2SearchResult) => {
              console.log('🔍 Converting three-layer result:', result);
              
              // Create ICD mappings from TM2 mappings for three-layer architecture
              const icdMappings = result.tm2Mappings?.map(mapping => ({
                // Layer 3: ICD-11 MMS information (final layer)
                code: mapping.icdCode,           // ICD-11 code (e.g., "5A14" for diabetes)
                title: mapping.icdTitle,         // ICD-11 title (e.g., "Type 2 diabetes mellitus")
                confidence: mapping.icdConfidence || mapping.overallConfidence,
                module: "MMS" as const,          // ICD-11 MMS module (not TM2)
                
                // Layer 2: TM2 Bridge information (middle layer)
                tm2Code: mapping.tm2Code,        // TM2 code (e.g., "TM2-003")
                tm2Title: mapping.tm2Title,      // TM2 title (e.g., "Prameha (Diabetes pattern)")
                tm2Confidence: mapping.tm2Confidence,
                traditionalSystem: mapping.traditionalSystem,
              })) || [];

              const convertedResult = {
                code: result.code,
                display: result.display,
                system: result.system,
                synonyms: result.synonyms,
                icdMappings,
                tm2Mappings: result.tm2Mappings, // Add TM2 mappings
              };
              
              console.log('✅ Converted result:', convertedResult);
              return convertedResult;
            });

            console.log('✅ Formatted three-layer results:', results);
            setSearchResults(results);
          } else {
            console.log('⚠️ No three-layer results, falling back to dual-layer search');
            // Fallback to dual-layer search if no three-layer results
            throw new Error('No three-layer results found');
          }
        } catch (threeLayerError) {
          console.log('❌ Three-layer search failed, falling back to dual-layer:', threeLayerError);
          // Fallback to traditional dual-layer search
          const namasteResponse = await axios.get(`http://localhost:3000/api/namaste`, {
            params: { term }
          });

          const namasteCodes = namasteResponse.data;
          console.log('Fallback dual-layer search results:', namasteCodes);
          setSearchResults(namasteCodes);
        }
      } else {
        // Fallback to traditional dual-layer search
        console.log('⚡ Using traditional dual-layer search');
        
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
                confidence: mapping.overallConfidence || mapping.confidence || 0.5, // Use new overallConfidence
                module: mapping.module || "TM2", // Updated to show TM2 module
                title: mapping.icdDetails?.title || mapping.icdTitle || mapping.icd_title || "Unknown ICD Title",
                // Include three-layer data
                tm2Code: mapping.tm2Code,
                tm2Title: mapping.tm2Title,
                tm2Confidence: mapping.tm2Confidence,
                traditionalSystem: mapping.traditionalSystem
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
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      // Fallback to empty results
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // --- Add Problem ---
  const handleAddProblem = () => {
    if (!selectedNAMASTE) return;

    let bestMapping;
    let tm2Info = {};

    if (useThreeLayer && selectedNAMASTE.tm2Mappings && selectedNAMASTE.tm2Mappings.length > 0) {
      // Use three-layer mapping - find the best TM2 mapping
      const bestTM2Mapping = selectedNAMASTE.tm2Mappings.reduce((prev, curr) => 
        curr.overallConfidence > prev.overallConfidence ? curr : prev
      );

      bestMapping = {
        code: bestTM2Mapping.icdCode,
        title: bestTM2Mapping.icdTitle,
        confidence: bestTM2Mapping.overallConfidence,
        module: "TM2" as const
      };

      tm2Info = {
        tm2Code: bestTM2Mapping.tm2Code,
        tm2Title: bestTM2Mapping.tm2Title,
        tm2Confidence: bestTM2Mapping.tm2Confidence,
        traditionalSystem: bestTM2Mapping.traditionalSystem,
      };

      console.log('🩺 Using three-layer mapping:', {
        namaste: selectedNAMASTE.code,
        tm2: bestTM2Mapping.tm2Code,
        icd: bestTM2Mapping.icdCode,
        confidence: bestTM2Mapping.overallConfidence
      });
    } else {
      // Fallback to traditional dual-layer mapping
      const tm2Mappings = selectedNAMASTE.icdMappings.filter(m => m.module === "TM2");
      const mmsMappings = selectedNAMASTE.icdMappings.filter(m => m.module === "MMS");
      
      bestMapping = tm2Mappings.length > 0
        ? tm2Mappings.reduce((prev, curr) => curr.confidence > prev.confidence ? curr : prev)
        : mmsMappings[0];

      console.log('⚡ Using traditional mapping:', {
        namaste: selectedNAMASTE.code,
        icd: bestMapping?.code,
        confidence: bestMapping?.confidence
      });
    }

    const newProblem: Problem = {
      _id: Date.now().toString(),
      namasteCode: selectedNAMASTE.code,
      namasteTerm: selectedNAMASTE.display,
      icdCode: bestMapping?.code || "N/A",
      icdTerm: bestMapping?.title || "No ICD Mapping",
      confidence: bestMapping?.confidence ?? 0,
      status: "active",
      ...tm2Info, // Spread TM2 information if available
    };

    setProblemList((prev) => [...prev, newProblem]);
    setProblemInput("");
    setSelectedNAMASTE(null);
    setSearchResults([]);
    
    // Clear problems error when a problem is added
    if (formErrors.problems) {
      const newErrors = { ...formErrors };
      delete newErrors.problems;
      setFormErrors(newErrors);
    }
  };

  // --- Submit Prescription ---
  const handleSubmitPrescription = async () => {
    // Clear previous success state and errors
    setSubmitSuccess(false);
    clearFormErrors();

    // Validate form
    if (!validatePrescriptionForm()) {
      return;
    }

    setIsSubmittingPrescription(true);

    console.log('Submitting prescription with doctor info:', {
      doctorId: user.id,
      doctorName: user.name,
      doctorRole: user.role,
      problemCount: problemList.length,
      prescriptionLength: prescriptionText.length
    });

    try {
      let submittedRecords = 0;

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
          prescriptionData,
          recordNumber: submittedRecords + 1
        });

        // Submit medical record
        await axios.post(`http://localhost:3000/api/patient/${abhaId}/records`, prescriptionData);
        submittedRecords++;
      }

      console.log(`Successfully submitted ${submittedRecords} medical records`);

      // Create FHIR bundle (optional - don't fail if this fails)
      try {
        await axios.post("http://localhost:3000/fhir/bundle", {
          patientId: abhaId,
          problems: problemList,
          prescription: prescriptionText,
        });
        console.log('FHIR bundle created successfully');
      } catch (fhirError) {
        console.warn('FHIR bundle creation failed (non-critical):', fhirError);
      }

      // Refresh patient data
      const response = await axios.get(`http://localhost:3000/api/patient/${abhaId}`);
      setPatientData(response.data);

      // Show success and clear form
      setSubmitSuccess(true);
      clearForm();

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);

    } catch (err: any) {
      console.error("❌ Error submitting prescription:", err);
      
      let errorMessage = "An unexpected error occurred while submitting the prescription.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Set form error for display
      setFormErrors({
        submit: errorMessage
      });

      // Also log detailed error information
      console.error("Prescription submission error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
    } finally {
      setIsSubmittingPrescription(false);
    }
  };

  // Edit/Delete handlers
  const handleStartEdit = (record: any) => {
    console.log('Edit button clicked! Record:', record);
    console.log('Record ID:', record._id);
    
    setEditingRecord(record._id);
    setEditingData({
      namasteTerm: record.namasteTerm,
      namasteCode: record.namasteCode,
      tm2Title: record.tm2Title || '',
      tm2Code: record.tm2Code || '',
      icdTerm: record.icdTerm,
      icdCode: record.icdCode,
      prescription: record.prescription || ''
    });
    
    console.log('Edit state set:', {
      editingRecord: record._id,
      editingData: {
        namasteTerm: record.namasteTerm,
        namasteCode: record.namasteCode,
        tm2Title: record.tm2Title || '',
        tm2Code: record.tm2Code || '',
        icdTerm: record.icdTerm,
        icdCode: record.icdCode,
        prescription: record.prescription || ''
      }
    });
  };

  const handleCancelEdit = () => {
    console.log('Cancel edit button clicked');
    setEditingRecord(null);
    setEditingData(null);
  };

  const handleSaveEdit = async (recordId: string) => {
    console.log('Save edit button clicked! Record ID:', recordId);
    console.log('Editing data:', editingData);
    
    if (!editingData || !patientData) {
      console.error('Missing data for save:', { editingData, patientData });
      alert('Missing data. Cannot save changes.');
      return;
    }

    setIsSavingEdit(true);
    try {
      console.log('Attempting to save edited record:', {
        recordId,
        editingData,
        url: `http://localhost:3000/api/patient/${patientData.abhaId}/records/${recordId}`
      });
      
      const updateResponse = await axios.put(`http://localhost:3000/api/patient/${patientData.abhaId}/records/${recordId}`, editingData);
      console.log('Update response:', updateResponse.data);
      
      // Refresh patient data
      console.log('Refreshing patient data after edit...');
      const response = await axios.get(`http://localhost:3000/api/patient/${patientData.abhaId}`);
      setPatientData(response.data);
      
      // Clear editing state
      setEditingRecord(null);
      setEditingData(null);
      
      console.log('Record updated successfully');
      alert('Medical record updated successfully!');
    } catch (error: any) {
      console.error('Error updating record:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Error updating record: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteMedicalRecord = async (recordId: string) => {
    console.log('Delete button clicked! Record ID:', recordId);
    console.log('Patient data:', patientData);
    
    if (!patientData) {
      console.error('No patient data available');
      alert('No patient data available. Please load a patient first.');
      return;
    }

    if (!recordId) {
      console.error('No record ID provided');
      alert('Invalid record ID. Cannot delete record.');
      return;
    }

    if (!confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      console.log('User cancelled deletion');
      return;
    }

    setIsDeletingRecord(recordId);
    try {
      console.log('Attempting to delete medical record:', {
        recordId,
        abhaId: patientData.abhaId,
        url: `http://localhost:3000/api/patient/${patientData.abhaId}/records/${recordId}`
      });
      
      const deleteResponse = await axios.delete(`http://localhost:3000/api/patient/${patientData.abhaId}/records/${recordId}`);
      console.log('Delete response:', deleteResponse.data);
      
      // Refresh patient data
      console.log('Refreshing patient data...');
      const response = await axios.get(`http://localhost:3000/api/patient/${patientData.abhaId}`);
      setPatientData(response.data);
      
      console.log('Record deleted successfully');
      alert('Medical record deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting record:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Error deleting record: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeletingRecord(null);
    }
  };

  // Load TM2 statistics on component mount
  useEffect(() => {
    const loadTM2Stats = async () => {
      try {
        const stats = await getTM2Statistics();
        setTM2Stats(stats);
        console.log('🩺 TM2 Statistics loaded:', stats);
      } catch (error) {
        console.error('Failed to load TM2 statistics:', error);
      }
    };

    if (useThreeLayer) {
      loadTM2Stats();
    }
  }, [useThreeLayer]);

  // Log component state on each render
  console.log('DoctorDashboard render state:', {
    selectedNAMASTE,
    searchResults,
    isSearching,
    useThreeLayer,
    tm2Stats
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
                          <div className="space-y-4">
                            {patientData.medicalRecords?.length > 0 ? (
                              patientData.medicalRecords.map((record: any, index: number) => (
                                <div key={record._id || index} className="medical-card hover:shadow-xl transition-all duration-300 overflow-hidden">
                                  {/* Header Section */}
                                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-foreground">Medical Record #{index + 1}</h4>
                                          <p className="text-xs text-muted-foreground">
                                            📅 {new Date(record.date).toLocaleDateString('en-US', { 
                                              weekday: 'short', 
                                              year: 'numeric', 
                                              month: 'short', 
                                              day: 'numeric' 
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                          {editingRecord === record._id ? (
                                            // Save and Cancel buttons when editing
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSaveEdit(record._id)}
                                                disabled={isSavingEdit}
                                                className="h-8 px-3 bg-success/10 hover:bg-success/20 text-success border-success/30"
                                                title="Save changes"
                                              >
                                                {isSavingEdit ? (
                                                  <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin mr-1" />
                                                ) : (
                                                  <Save className="w-3 h-3 mr-1" />
                                                )}
                                                Save
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                disabled={isSavingEdit}
                                                className="h-8 px-3 bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                                                title="Cancel editing"
                                              >
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Cancel
                                              </Button>
                                            </>
                                          ) : (
                                            // Edit and Delete buttons when not editing
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStartEdit(record)}
                                                disabled={editingRecord !== null || isDeletingRecord === record._id}
                                                className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                                                title="Edit medical record"
                                              >
                                                <Edit3 className="w-3 h-3 mr-1" />
                                                Edit
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteMedicalRecord(record._id)}
                                                disabled={isDeletingRecord === record._id || editingRecord !== null}
                                                className="h-8 px-3 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                                                title="Delete medical record"
                                              >
                                                {isDeletingRecord === record._id ? (
                                                  <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin mr-1" />
                                                ) : (
                                                  <Trash2 className="w-3 h-3 mr-1" />
                                                )}
                                                {isDeletingRecord === record._id ? 'Deleting...' : 'Delete'}
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                        
                                        {/* Status Badge */}
                                        <Badge variant={
                                          record.approvalStatus === 'approved' ? 'default' :
                                          record.approvalStatus === 'rejected' ? 'destructive' :
                                          'secondary'
                                        } className="text-xs">
                                          {record.approvalStatus === 'pending' ? '⏳ Pending' : 
                                           record.approvalStatus === 'approved' ? '✅ Approved' : 
                                           '❌ Rejected'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Content Section */}
                                  <div className="p-4 space-y-4">
                                    {/* Layer 1: NAMASTE Ayurvedic Diagnosis */}
                                    <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-lg p-4 border border-secondary/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                          <span className="text-secondary-foreground text-xs font-bold">1</span>
                                        </div>
                                        <h5 className="font-semibold text-secondary-foreground">NAMASTE Ayurvedic Diagnosis</h5>
                                      </div>
                                      
                                      {editingRecord === record._id ? (
                                        // Editable fields
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-sm font-medium text-foreground block mb-1">Ayurvedic Diagnosis:</label>
                                            <Input
                                              value={editingData?.namasteTerm || ''}
                                              onChange={(e) => setEditingData(prev => prev ? {...prev, namasteTerm: e.target.value} : null)}
                                              className="bg-input border-secondary/30 focus:border-secondary text-foreground"
                                              placeholder="Enter Ayurvedic diagnosis..."
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-foreground block mb-1">NAMASTE Code:</label>
                                            <Input
                                              value={editingData?.namasteCode || ''}
                                              onChange={(e) => setEditingData(prev => prev ? {...prev, namasteCode: e.target.value} : null)}
                                              className="bg-input border-secondary/30 focus:border-secondary text-foreground font-mono"
                                              placeholder="Enter NAMASTE code..."
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        // Display mode
                                        <div className="space-y-2">
                                          <p className="text-lg font-semibold text-foreground">{record.namasteTerm}</p>
                                          <div className="inline-block bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-mono">
                                            🌿 {record.namasteCode}
                                          </div>
                                          <div className="mt-2 text-xs text-secondary">
                                            Traditional Ayurvedic Classification
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Layer 3: ICD-11 International Standard */}
                                    <div className="bg-gradient-to-r from-info/20 to-info/10 rounded-lg p-4 border border-info/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-info rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">3</span>
                                        </div>
                                        <h5 className="font-semibold text-info-foreground">ICD-11 International Standard</h5>
                                      </div>
                                      
                                      {editingRecord === record._id ? (
                                        // Editable fields
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-sm font-medium text-foreground block mb-1">ICD-11 Description:</label>
                                            <Input
                                              value={editingData?.icdTerm || ''}
                                              onChange={(e) => setEditingData(prev => prev ? {...prev, icdTerm: e.target.value} : null)}
                                              className="bg-input border-info/30 focus:border-info text-foreground"
                                              placeholder="Enter ICD-11 description..."
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-foreground block mb-1">ICD-11 Code:</label>
                                            <Input
                                              value={editingData?.icdCode || ''}
                                              onChange={(e) => setEditingData(prev => prev ? {...prev, icdCode: e.target.value} : null)}
                                              className="bg-input border-info/30 focus:border-info text-foreground font-mono"
                                              placeholder="Enter ICD-11 code..."
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        // Display mode
                                        <div className="space-y-2">
                                          <p className="text-lg font-semibold text-foreground">{record.icdTerm}</p>
                                          <div className="inline-block bg-info/20 text-info px-3 py-1 rounded-full text-sm font-mono">
                                            � {record.icdCode}
                                          </div>
                                          <div className="mt-2 text-xs text-info">
                                            WHO International Classification
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* TM2 Bridge Layer */}
                                    <div className="bg-gradient-to-r from-warning/20 to-warning/10 rounded-lg p-4 border border-warning/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                                          <span className="text-warning-foreground text-xs font-bold">2</span>
                                        </div>
                                        <h5 className="font-semibold text-warning-foreground">TM2 Bridge Layer</h5>
                                      </div>
                                      
                                      {editingRecord === record._id ? (
                                        // Editable fields
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-sm font-medium text-foreground block mb-1">TM2 Term:</label>
                                            <Input
                                              value={editingData?.tm2Title || ''}
                                              onChange={(e) => setEditingData(prev => prev ? {...prev, tm2Title: e.target.value} : null)}
                                              className="bg-input border-warning/30 focus:border-warning text-foreground"
                                              placeholder="Enter TM2 bridge term..."
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-foreground block mb-1">TM2 Code:</label>
                                            <Input
                                              value={editingData?.tm2Code || ''}
                                              onChange={(e) => setEditingData(prev => prev ? {...prev, tm2Code: e.target.value} : null)}
                                              className="bg-input border-warning/30 focus:border-warning text-foreground font-mono"
                                              placeholder="Enter TM2 code..."
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        // Display mode
                                        <div className="space-y-2">
                                          <p className="text-lg font-semibold text-foreground">{record.tm2Title || 'TM2 Semantic Bridge'}</p>
                                          <div className="inline-block bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-mono">
                                            🔗 {record.tm2Code || 'TM2-XXX'}
                                          </div>
                                          <div className="mt-2 text-xs text-warning">
                                            Traditional Medicine Semantic Bridge
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Three-Layer Architecture Visualization */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                      <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                                          <span className="text-primary-foreground text-xs">⚡</span>
                                        </div>
                                        Three-Layer Mapping Architecture
                                      </h5>
                                      <div className="flex items-center justify-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/20 rounded-lg border border-secondary/30">
                                          <span className="text-secondary font-mono text-sm">{record.namasteCode}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-primary">
                                          <div className="w-6 h-px bg-primary"></div>
                                          <span className="text-xs">→</span>
                                          <div className="w-6 h-px bg-primary"></div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-warning/20 rounded-lg border border-warning/30">
                                          <span className="text-warning font-mono text-sm">{record.tm2Code || 'TM2-XXX'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-primary">
                                          <div className="w-6 h-px bg-primary"></div>
                                          <span className="text-xs">→</span>
                                          <div className="w-6 h-px bg-primary"></div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-info/20 rounded-lg border border-info/30">
                                          <span className="text-info font-mono text-sm">{record.icdCode}</span>
                                        </div>
                                      </div>
                                      <p className="text-center text-xs text-muted-foreground mt-2">
                                        NAMASTE → TM2 → ICD-11 semantic mapping flow
                                      </p>
                                    </div>
                                    
                                    {/* Prescription Section - Always visible */}
                                    <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg p-4 border border-accent/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                          <span className="text-accent-foreground text-xs">💊</span>
                                        </div>
                                        <h5 className="font-semibold text-accent-foreground">Prescription & Treatment Plan</h5>
                                      </div>
                                      
                                      {editingRecord === record._id ? (
                                        // Editable prescription
                                        <div>
                                          <label className="text-sm font-medium text-foreground block mb-2">Prescription Details:</label>
                                          <Textarea
                                            value={editingData?.prescription || ''}
                                            onChange={(e) => setEditingData(prev => prev ? {...prev, prescription: e.target.value} : null)}
                                            className="bg-input border-accent/30 focus:border-accent text-foreground min-h-[120px] resize-none"
                                            placeholder="Enter detailed prescription including medications, dosages, instructions, and follow-up recommendations..."
                                          />
                                          <p className="text-xs text-accent mt-1">
                                            💡 Tip: Include medication names, dosages, frequency, duration, and any special instructions
                                          </p>
                                        </div>
                                      ) : (
                                        // Display mode - Enhanced prescription display
                                        <div className="bg-card rounded-lg p-4 border border-border">
                                          {record.prescription ? (
                                            <div className="space-y-2">
                                              <div className="flex items-start gap-2">
                                                <span className="text-accent mt-1">📝</span>
                                                <div className="flex-1">
                                                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
{record.prescription}
                                                  </pre>
                                                </div>
                                              </div>
                                              <div className="pt-2 border-t border-border">
                                                <p className="text-xs text-accent flex items-center gap-1">
                                                  <span>⏰</span>
                                                  Prescribed on {new Date(record.date).toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric'
                                                  })}
                                                </p>
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-muted-foreground italic">No prescription details available</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Status Information */}
                                    {record.approvalStatus === 'pending' && (
                                      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                                        <p className="text-sm text-warning-foreground flex items-center gap-2">
                                          <span>⏳</span>
                                          <span className="font-medium">Awaiting curator approval</span>
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Curator Notes */}
                                    {record.curatorNotes && (
                                      <div className="bg-success/10 rounded-lg p-4 border border-success/30">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                                            <span className="text-success-foreground text-xs">📋</span>
                                          </div>
                                          <h5 className="font-semibold text-success-foreground">Curator Review Notes</h5>
                                        </div>
                                        <p className="text-sm text-foreground bg-card rounded p-3 border border-border">
                                          {record.curatorNotes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Footer with Doctor Info */}
                                  {record.doctorId && (
                                    <div className="bg-muted/30 px-4 py-3 border-t border-border">
                                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span>👨‍⚕️</span>
                                        <span><strong>Prescribed by:</strong> Dr. {user.name}</span>
                                        <span>•</span>
                                        <span>{new Date(record.submittedAt || record.date).toLocaleString()}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <span className="text-2xl">📋</span>
                                </div>
                                <p className="text-foreground font-medium">No medical history available</p>
                                <p className="text-sm text-muted-foreground mt-1">Patient records will appear here once submitted</p>
                              </div>
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
                        <p className="text-2xl font-bold">
                          {useThreeLayer && tm2Stats ? 
                            `${Math.round((tm2Stats.total / (tm2Stats.total + 6592)) * 100)}%` : 
                            '92%'
                          }
                        </p>
                        <p className="text-muted-foreground">
                          {useThreeLayer ? 'TM2 Coverage' : 'Mapping Accuracy'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* --- Search & Preview --- */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left: Search Panel */}
                  <Card className="h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <Search className="w-5 h-5 text-primary" />
                          NAMASTE Term Search
                        </CardTitle>
                        
                        {/* Three-Layer Toggle */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground">
                            Three-Layer Mode
                          </label>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={useThreeLayer}
                              onChange={(e) => {
                                setUseThreeLayer(e.target.checked);
                                console.log('🔄 Switched to', e.target.checked ? 'three-layer' : 'dual-layer', 'mode');
                                // Clear search results when switching modes
                                setSearchResults([]);
                                setSelectedNAMASTE(null);
                                setSearchTerm("");
                              }}
                              className="sr-only"
                            />
                            <div
                              className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                                useThreeLayer 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              }`}
                              onClick={() => {
                                const newMode = !useThreeLayer;
                                setUseThreeLayer(newMode);
                                console.log('🔄 Switched to', newMode ? 'three-layer' : 'dual-layer', 'mode');
                                // Clear search results when switching modes
                                setSearchResults([]);
                                setSelectedNAMASTE(null);
                                setSearchTerm("");
                              }}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                                  useThreeLayer 
                                    ? 'translate-x-6' 
                                    : 'translate-x-0.5'
                                } mt-0.5`}
                              />
                            </div>
                          </div>
                          {useThreeLayer && (
                            <Badge className="bg-green-500 text-white text-xs">
                              🩺 TM2
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Mode Description */}
                      <p className="text-sm text-muted-foreground mt-2">
                        {useThreeLayer 
                          ? '🩺 Using Traditional Medicine Module 2 for enhanced semantic mapping through NAMASTE → TM2 → ICD-11'
                          : '⚡ Using direct NAMASTE → ICD-11 mapping for faster results'
                        }
                      </p>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col space-y-6 overflow-y-auto">
                      {/* ABHA ID */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter ABHA ID (e.g., ABHA-1234-5678)"
                            value={abhaId}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              setAbhaId(value);
                              // Clear errors when user starts typing
                              if (formErrors.abhaId || formErrors.patient) {
                                const newErrors = { ...formErrors };
                                delete newErrors.abhaId;
                                delete newErrors.patient;
                                setFormErrors(newErrors);
                              }
                            }}
                            className={`${formErrors.abhaId ? 'border-red-500' : ''}`}
                          />
                          <Button 
                            onClick={async () => {
                              const trimmedAbhaId = abhaId.trim();
                              
                              if (!trimmedAbhaId) {
                                setFormErrors({ abhaId: "Please enter an ABHA ID" });
                                return;
                              }
                              
                              if (!validateAbhaId(trimmedAbhaId)) {
                                setFormErrors({ abhaId: "ABHA ID must be in format: ABHA-XXXX-XXXX" });
                                return;
                              }

                              setIsLoadingPatient(true);
                              clearFormErrors();
                              
                              try {
                                console.log('Fetching patient data for ABHA ID:', trimmedAbhaId);
                                const response = await axios.get(`http://localhost:3000/api/patient/${trimmedAbhaId}`);
                                console.log('Patient data received:', response.data);
                                setPatientData(response.data);
                                setAbhaId(trimmedAbhaId); // Update with trimmed value
                              } catch (error: any) {
                                console.error('Error loading patient:', error);
                                let errorMessage = 'Error loading patient data';
                                
                                if (error.response?.status === 404) {
                                  errorMessage = 'Patient not found. Please check the ABHA ID and try again.';
                                } else if (error.response?.data?.message) {
                                  errorMessage = error.response.data.message;
                                } else if (error.message) {
                                  errorMessage = error.message;
                                }
                                
                                setFormErrors({ patient: errorMessage });
                                setPatientData(null);
                              } finally {
                                setIsLoadingPatient(false);
                              }
                            }}
                            disabled={isLoadingPatient}
                          >
                            {isLoadingPatient ? 'Loading...' : 'Load Patient'}
                          </Button>
                        </div>
                        
                        {/* Error Messages */}
                        {formErrors.abhaId && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="text-red-500">⚠</span>
                            {formErrors.abhaId}
                          </p>
                        )}
                        {formErrors.patient && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="text-red-500">⚠</span>
                            {formErrors.patient}
                          </p>
                        )}
                        
                        {/* Patient Loaded Success */}
                        {patientData && !formErrors.patient && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            Patient loaded successfully: {patientData.name}
                          </p>
                        )}
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
                                  {result.code} • {
                                    useThreeLayer && result.tm2Mappings 
                                      ? `${result.tm2Mappings.length} TM2 mappings`
                                      : `${result.icdMappings.length} ICD mappings`
                                  }
                                  {useThreeLayer && result.tm2Mappings && result.tm2Mappings.length > 0 && (
                                    <span className="ml-2">
                                      <Badge variant="outline" className="text-xs">
                                        {result.tm2Mappings[0].traditionalSystem}
                                      </Badge>
                                    </span>
                                  )}
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
                            useThreeLayer && selectedNAMASTE.tm2Mappings && selectedNAMASTE.tm2Mappings.length > 0
                              ? selectedNAMASTE.tm2Mappings.map(tm2Mapping => {
                                  console.log('🩺 Processing three-layer mapping for preview:', tm2Mapping);
                                  return {
                                    // Layer 3: ICD-11 MMS information (final biomedical layer)
                                    code: tm2Mapping.icdCode,           // ICD-11 code
                                    title: tm2Mapping.icdTitle,         // ICD-11 title
                                    confidence: tm2Mapping.icdConfidence || tm2Mapping.overallConfidence,
                                    module: "MMS" as "MMS" | "TM2",     // ICD-11 MMS module
                                    
                                    // Layer 2: TM2 Bridge information (middle layer)
                                    tm2Code: tm2Mapping.tm2Code,
                                    tm2Title: tm2Mapping.tm2Title,
                                    tm2Confidence: tm2Mapping.tm2Confidence,
                                    traditionalSystem: tm2Mapping.traditionalSystem,
                                  };
                                })
                              : Array.isArray(selectedNAMASTE.icdMappings) && selectedNAMASTE.icdMappings.length > 0 
                                ? selectedNAMASTE.icdMappings.map(mapping => {
                                    console.log('⚡ Processing dual-layer mapping for preview:', mapping);
                                    return {
                                      // Direct ICD-11 mapping (dual-layer)
                                      code: mapping.code,
                                      title: mapping.title || 'Unknown Title',
                                      confidence: typeof mapping.confidence === 'number' ? mapping.confidence : 0,
                                      module: mapping.module as "MMS" | "TM2"
                                    };
                                  })
                                : []
                          }
                          showThreeLayer={useThreeLayer}
                        />
                        
                        {/* Debug Info */}
                        {selectedNAMASTE && (
                          <div className="p-2 text-xs text-gray-500 border-t">
                            <details className="cursor-pointer">
                              <summary>Debug Info</summary>
                              <div className="mt-2 space-y-1">
                                <p>Three-layer mode: {useThreeLayer ? 'ON' : 'OFF'}</p>
                                <p>TM2 mappings: {selectedNAMASTE.tm2Mappings?.length || 0}</p>
                                <p>ICD mappings: {selectedNAMASTE.icdMappings?.length || 0}</p>
                                {selectedNAMASTE.tm2Mappings?.length > 0 && (
                                  <p>First TM2: {selectedNAMASTE.tm2Mappings[0].tm2Code} → {selectedNAMASTE.tm2Mappings[0].icdCode}</p>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
                      </Card>
                    )}

                    <Card className="flex-1 flex flex-col shadow-md">
                      <CardHeader>
                        <CardTitle>Add Problems & Prescription</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col space-y-6 overflow-y-auto p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="font-medium">Add Problem</p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Select a problem from search results..."
                                value={problemInput}
                                onChange={(e) => setProblemInput(e.target.value)}
                                className="flex-1"
                                disabled={true} // Make it read-only to encourage using search
                              />
                              <Button
                                onClick={handleAddProblem}
                                className="shrink-0"
                                disabled={!selectedNAMASTE}
                              >
                                Add Problem
                              </Button>
                            </div>
                            
                            {!selectedNAMASTE && problemInput && (
                              <p className="text-sm text-amber-600 flex items-center gap-1">
                                <span className="text-amber-500">ℹ</span>
                                Please select a problem from the search results above
                              </p>
                            )}
                            
                            {formErrors.problems && (
                              <p className="text-sm text-red-600 flex items-center gap-1">
                                <span className="text-red-500">⚠</span>
                                {formErrors.problems}
                              </p>
                            )}
                          </div>

                          {/* Problem List */}
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-3">
                              <p className="font-medium">Current Problem List</p>
                              {problemList.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  {problemList.length} problem{problemList.length !== 1 ? 's' : ''} added
                                </span>
                              )}
                            </div>
                            
                            {problemList.length === 0 ? (
                              <div className="text-sm text-muted-foreground p-6 border border-dashed rounded-lg text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                                  <p>No problems added yet</p>
                                  <p className="text-xs">Search and select problems from above to add them here</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {problemList.map((problem, index) => (
                                  <div
                                    key={problem._id}
                                    className="p-3 border rounded-lg hover:bg-muted/30 transition-colors group"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                                            #{index + 1}
                                          </span>
                                          <strong className="text-sm">{problem.namasteTerm}</strong>
                                        </div>
                                        
                                        <div className="text-xs text-muted-foreground space-y-1">
                                          {/* Three-layer display */}
                                          {useThreeLayer && problem.tm2Code ? (
                                            <div className="space-y-2">
                                              {/* Layer Flow */}
                                              <div className="flex items-center gap-2 text-xs">
                                                <span className="font-medium text-orange-600">NAMASTE</span>
                                                <span>→</span>
                                                <span className="font-medium text-green-600">TM2</span>
                                                <span>→</span>
                                                <span className="font-medium text-blue-600">ICD-11</span>
                                                {problem.traditionalSystem && (
                                                  <Badge variant="outline" className="text-xs ml-2">
                                                    {problem.traditionalSystem}
                                                  </Badge>
                                                )}
                                              </div>
                                              
                                              {/* Codes */}
                                              <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="bg-orange-50 p-2 rounded border border-orange-200">
                                                  <div className="font-medium text-orange-800">{problem.namasteCode}</div>
                                                  <div className="text-orange-600 text-xs">Traditional</div>
                                                </div>
                                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                                  <div className="font-medium text-green-800">{problem.tm2Code}</div>
                                                  <div className="text-green-600 text-xs">TM2 Bridge</div>
                                                  {problem.tm2Confidence && (
                                                    <div className="text-xs">
                                                      {(problem.tm2Confidence * 100).toFixed(0)}%
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                                  <div className="font-medium text-blue-800">{problem.icdCode}</div>
                                                  <div className="text-blue-600 text-xs">ICD-11</div>
                                                  {problem.confidence && (
                                                    <div className="text-xs">
                                                      {(problem.confidence * 100).toFixed(0)}%
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Descriptions */}
                                              {problem.tm2Title && (
                                                <div className="text-xs">
                                                  <strong>TM2 Pattern:</strong> {problem.tm2Title}
                                                </div>
                                              )}
                                              {problem.icdTerm && problem.icdTerm !== "No ICD Mapping" && (
                                                <div className="text-xs">
                                                  <strong>ICD Description:</strong> {problem.icdTerm}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            /* Traditional dual-layer display */
                                            <div>
                                              <div className="flex items-center gap-4">
                                                <span>
                                                  <strong>NAMASTE:</strong> {problem.namasteCode}
                                                </span>
                                                <span>
                                                  <strong>ICD:</strong> {problem.icdCode}
                                                </span>
                                              </div>
                                              
                                              {problem.icdTerm && problem.icdTerm !== "No ICD Mapping" && (
                                                <div className="text-xs">
                                                  <strong>ICD Description:</strong> {problem.icdTerm}
                                                </div>
                                              )}
                                              
                                              {problem.confidence !== undefined && problem.confidence > 0 && (
                                                <div className="flex items-center gap-1">
                                                  <strong>Confidence:</strong>
                                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                                    problem.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                                                    problem.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                  }`}>
                                                    {(problem.confidence * 100).toFixed(0)}%
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveProblem(problem._id)}
                                        className="ml-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                                        title="Remove problem"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Prescription */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">Prescription / Notes</p>
                            <span className="text-xs text-muted-foreground">
                              {prescriptionText.length}/1000 characters
                            </span>
                          </div>
                          <Textarea
                            rows={6}
                            value={prescriptionText}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 1000) {
                                setPrescriptionText(value);
                                // Clear prescription error when user starts typing
                                if (formErrors.prescription) {
                                  const newErrors = { ...formErrors };
                                  delete newErrors.prescription;
                                  setFormErrors(newErrors);
                                }
                              }
                            }}
                            placeholder="Enter detailed prescription including:&#10;• Medications and dosages&#10;• Instructions for use&#10;• Duration of treatment&#10;• Follow-up recommendations&#10;• Additional notes"
                            className={`resize-none ${formErrors.prescription ? 'border-red-500' : ''}`}
                            maxLength={1000}
                          />
                          
                          {formErrors.prescription && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <span className="text-red-500">⚠</span>
                              {formErrors.prescription}
                            </p>
                          )}
                        </div>

                        {/* Success Message */}
                        {submitSuccess && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 flex items-center gap-2">
                              <span className="text-green-600 text-lg">✅</span>
                              <span className="font-medium">Prescription submitted successfully!</span>
                            </p>
                            <p className="text-green-700 text-sm mt-1">
                              Medical records have been added and are pending curator approval.
                            </p>
                          </div>
                        )}

                        {/* Submit Error */}
                        {formErrors.submit && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 flex items-center gap-2">
                              <span className="text-red-600 text-lg">❌</span>
                              <span className="font-medium">Submission failed</span>
                            </p>
                            <p className="text-red-700 text-sm mt-1">
                              {formErrors.submit}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {/* Preview Button */}
                          <Dialog open={showPreview} onOpenChange={setShowPreview}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="lg"
                                disabled={!patientData || problemList.length === 0 || !prescriptionText.trim()}
                                className="flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Prescription Preview</DialogTitle>
                                <DialogDescription>
                                  Review the complete prescription before submitting
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Patient Information */}
                                {patientData && (
                                  <div className="p-4 bg-muted/50 rounded-lg">
                                    <h3 className="font-semibold mb-2">Patient Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p><strong>Name:</strong> {patientData.name}</p>
                                        <p><strong>ABHA ID:</strong> {patientData.abhaId}</p>
                                      </div>
                                      <div>
                                        <p><strong>Email:</strong> {patientData.email}</p>
                                        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Doctor Information */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                  <h3 className="font-semibold mb-2">Prescribing Doctor</h3>
                                  <div className="text-sm">
                                    <p><strong>Dr. {user.name}</strong></p>
                                    <p>{user.email}</p>
                                  </div>
                                </div>

                                {/* Problems Diagnosed */}
                                <div className="p-4 bg-amber-50 rounded-lg">
                                  <h3 className="font-semibold mb-3">Problems Diagnosed ({problemList.length})</h3>
                                  <div className="space-y-3">
                                    {problemList.map((problem, index) => (
                                      <div key={problem._id} className="border-l-4 border-amber-400 pl-4">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-medium">
                                            Problem #{index + 1}
                                          </span>
                                          <strong className="text-sm">{problem.namasteTerm}</strong>
                                        </div>
                                        
                                        <div className="text-xs text-muted-foreground space-y-1">
                                          <p><strong>NAMASTE Code:</strong> {problem.namasteCode}</p>
                                          <p><strong>ICD-11 Code:</strong> {problem.icdCode}</p>
                                          {problem.icdTerm && problem.icdTerm !== "No ICD Mapping" && (
                                            <p><strong>ICD-11 Description:</strong> {problem.icdTerm}</p>
                                          )}
                                          {problem.confidence !== undefined && problem.confidence > 0 && (
                                            <p>
                                              <strong>Mapping Confidence:</strong> 
                                              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                                                problem.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                                                problem.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                                {(problem.confidence * 100).toFixed(0)}%
                                              </span>
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Prescription Details */}
                                <div className="p-4 bg-green-50 rounded-lg">
                                  <h3 className="font-semibold mb-3">Prescription & Treatment Plan</h3>
                                  <div className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
                                    {prescriptionText}
                                  </div>
                                </div>

                                {/* Action Buttons in Preview */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowPreview(false)}
                                  >
                                    Back to Edit
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setShowPreview(false);
                                      handleSubmitPrescription();
                                    }}
                                    className="bg-success hover:bg-success/90 text-white"
                                    disabled={isSubmittingPrescription}
                                  >
                                    {isSubmittingPrescription ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                      </div>
                                    ) : (
                                      "Submit Prescription"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Submit Button */}
                          <Button
                            onClick={handleSubmitPrescription}
                            size="lg"
                            className="bg-success hover:bg-success/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmittingPrescription || !patientData || problemList.length === 0 || !prescriptionText.trim()}
                          >
                            {isSubmittingPrescription ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                              </div>
                            ) : (
                              "Submit Prescription"
                            )}
                          </Button>
                          
                          {/* Clear Button */}
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={clearForm}
                            disabled={isSubmittingPrescription}
                          >
                            Clear All
                          </Button>
                        </div>

                        {/* Validation Summary */}
                        {!isSubmittingPrescription && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p className="font-medium">Before submitting, ensure:</p>
                            <ul className="space-y-0.5 ml-4">
                              <li className={`flex items-center gap-1 ${patientData ? 'text-green-600' : 'text-red-500'}`}>
                                <span>{patientData ? '✓' : '○'}</span>
                                Patient data is loaded
                              </li>
                              <li className={`flex items-center gap-1 ${problemList.length > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                <span>{problemList.length > 0 ? '✓' : '○'}</span>
                                At least one problem is added ({problemList.length} added)
                              </li>
                              <li className={`flex items-center gap-1 ${prescriptionText.trim().length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                                <span>{prescriptionText.trim().length >= 10 ? '✓' : '○'}</span>
                                Prescription details are complete (min 10 chars)
                              </li>
                            </ul>
                          </div>
                        )}
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


