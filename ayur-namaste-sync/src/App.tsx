import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LoginPage } from "./pages/LoginPage";
import { PatientDashboard } from "./pages/PatientDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { CuratorDashboard } from "./pages/CuratorDashboard";
import NotFound from "./pages/NotFound";
import { User } from "@/lib/mockData";
import Home from "./pages/Home";
import DocsPage from "./pages/DocsPage";
import API from "./pages/API";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const getDashboardComponent = () => {
    if (!user) return <Navigate to="/" replace />;
    
    switch (user.role) {
      case 'patient': return <PatientDashboard user={user} onLogout={handleLogout} />;
      case 'doctor': return <DoctorDashboard user={user} onLogout={handleLogout} />;
      case 'curator': return <CuratorDashboard user={user} onLogout={handleLogout} />;
      default: return <Navigate to="/" replace />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  <LoginPage 
                    onLogin={handleLogin} 
                    isAuthenticated={isAuthenticated} 
                  />
                } 
              />
              <Route path="/dashboard" element={getDashboardComponent()} />
              <Route path="/doctor" element={getDashboardComponent()} />
              <Route path="/curator" element={getDashboardComponent()} />
              <Route path="*" element={<NotFound />} />
              <Route path="/home" element={<Home />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/api" element={<API />} />

            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
