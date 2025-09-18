import { SidebarProvider } from '@/components/ui/sidebar';
import { Layout } from '@/components/Layout';
import { AppSidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { PatientCard } from '@/components/PatientCard';
import { ApprovedRecordsList } from '@/components/ApprovedRecordsList';
import { User } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { generateMedicalRecordsPDF } from '@/utils/pdfGenerator';
import { downloadTextFile } from '@/utils/textGenerator';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

interface ApprovedRecord {
  id: string;
  patientName: string;
  patientAbhaId: string;
  doctorName: string;
  doctorEmail: string;
  curatorName?: string;
  namasteCode: string;
  namasteTerm: string;
  icdCode: string;
  icdTerm: string;
  prescription: string;
  date: string;
  submittedAt: string;
  approvedAt?: string;
  curatorNotes?: string;
  status: string;
}

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [approvedRecords, setApprovedRecords] = useState<ApprovedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch approved medical records from backend
  const fetchApprovedRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching approved records for patient:', user.abhaId);
      const response = await axios.get(`http://localhost:3000/api/patient/${user.abhaId}/approved-records`);
      console.log('Approved records response:', response.data);
      setApprovedRecords(response.data);
    } catch (error) {
      console.error('Error fetching approved records:', error);
      setError('Failed to fetch medical records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedRecords();
  }, [user.abhaId]);



  const handleDownloadSummary = async () => {
    try {
      if (approvedRecords.length === 0) {
        alert('No approved medical records to download. Records will be available after curator approval.');
        return;
      }

      console.log('Generating PDF for patient:', user.name);
      console.log('Records to include:', approvedRecords.length);
      console.log('Patient data:', user);
      console.log('Records data:', approvedRecords);
      
      // Try PDF generation first
      try {
        const filename = generateMedicalRecordsPDF(user, approvedRecords);
        
        // Show success message
        setTimeout(() => {
          alert(`✅ Medical records PDF "${filename}" has been downloaded successfully!\n\n📄 Check your Downloads folder.`);
        }, 1000);
        
      } catch (pdfError) {
        console.warn('PDF generation failed, falling back to text file:', pdfError);
        
        // Fallback to text file if PDF fails
        const textFilename = downloadTextFile(user, approvedRecords);
        
        setTimeout(() => {
          alert(`📄 PDF generation failed, but text summary "${textFilename}" has been downloaded.\n\n💡 This contains all your medical records in text format.`);
        }, 500);
      }
      
    } catch (error) {
      console.error('Error generating download:', error);
      
      let errorMessage = 'Error generating medical records file. ';
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      alert(`❌ ${errorMessage}\n\nPlease check the console for more details and try again.`);
    }
  };

  return (
    <Layout>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar userRole="patient" />
          <div className="flex-1 flex flex-col">
            <TopBar user={user} onLogout={onLogout} />
            <main className="flex-1 p-6 space-y-6">
              {/* Header with refresh button */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
                  <p className="text-gray-600 mt-1">
                    {approvedRecords.length > 0 
                      ? `Showing ${approvedRecords.length} approved medical record${approvedRecords.length > 1 ? 's' : ''}` 
                      : 'No approved medical records found'}
                  </p>
                </div>
                {!isLoading && (
                  <button
                    onClick={fetchApprovedRecords}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Records
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <PatientCard patient={user} />
                </div>
                <div className="lg:col-span-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading your medical records...</span>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <div className="text-red-600 font-semibold mb-2">Error Loading Records</div>
                      <p className="text-red-700 mb-4">{error}</p>
                      <button
                        onClick={fetchApprovedRecords}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : approvedRecords.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                      <div className="text-blue-600 font-semibold mb-2">No Approved Medical Records</div>
                      <p className="text-blue-700 mb-4">
                        You don't have any approved medical records yet. Medical records need to be approved by a curator before they appear here.
                      </p>
                      <p className="text-blue-600 text-sm">
                        Records will automatically appear here once they are approved by our medical curators.
                      </p>
                    </div>
                  ) : (
                    <ApprovedRecordsList 
                      records={approvedRecords}
                      onDownloadSummary={handleDownloadSummary}
                    />
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
}