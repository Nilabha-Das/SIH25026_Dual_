import { SidebarProvider } from '@/components/ui/sidebar';
import { Layout } from '@/components/Layout';
import { AppSidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { PatientCard } from '@/components/PatientCard';
import { ProblemList } from '@/components/ProblemList';
import { User, getPatientRecords } from '@/lib/mockData';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const patientRecords = getPatientRecords(user.abhaId);

  const handleDownloadSummary = () => {
    alert('PDF summary download feature would be implemented here');
  };

  return (
    <Layout>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar userRole="patient" />
          <div className="flex-1 flex flex-col">
            <TopBar user={user} onLogout={onLogout} />
            <main className="flex-1 p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <PatientCard patient={user} />
                </div>
                <div className="lg:col-span-2">
                  <ProblemList 
                    records={patientRecords} 
                    showActions={true}
                    onDownloadSummary={handleDownloadSummary}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
}