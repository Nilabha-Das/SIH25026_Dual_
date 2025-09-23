import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, UserCog, Stethoscope, User, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RoleSelectionProps {
  onRoleSelected: (user: any) => void;
}

type Role = "patient" | "doctor" | "curator";

const roleInfo = {
  patient: {
    icon: User,
    title: "Patient",
    description: "Access your medical records, view prescriptions, and manage your health data",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/15",
    iconBg: "bg-primary/20"
  },
  doctor: {
    icon: Stethoscope,
    title: "Doctor", 
    description: "Manage patient records, create prescriptions, and provide medical consultations",
    color: "text-success",
    bgColor: "bg-success/10 hover:bg-success/15",
    iconBg: "bg-success/20"
  },
  curator: {
    icon: Shield,
    title: "Curator",
    description: "Review and approve medical records, manage data quality, and oversee system integrity", 
    color: "text-secondary",
    bgColor: "bg-secondary/10 hover:bg-secondary/15",
    iconBg: "bg-secondary/20"
  }
};

export function RoleSelection({ onRoleSelected }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const userParam = searchParams.get('user');

  console.log('RoleSelection component loaded');
  console.log('URL search params:', Object.fromEntries(searchParams.entries()));
  console.log('Token:', token);
  console.log('User param:', userParam);

  // If no token, redirect to login
  if (!token || !userParam) {
    console.log('Missing token or user param, redirecting to login');
    console.log('Token:', token);
    console.log('User param:', userParam);
    navigate('/login');
    return null;
  }

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/select-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          role: selectedRole
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Server returned invalid JSON response');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update role');
      }

      // Store updated user data and token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call the callback to update app state
      onRoleSelected(data.user);

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-background bg-gradient-to-br from-background via-background to-card">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Welcome to AYUSH EMR</h1>
          <p className="text-foreground/70 text-lg max-w-md mx-auto leading-relaxed">
            Please select your role to customize your healthcare experience
          </p>
        </div>

        {/* Role Selection Cards */}
        <Card className="medical-card shadow-xl border-border/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <UserCog className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Choose Your Role</h2>
                <p className="text-foreground/60 text-base mt-1">
                  Select the role that best describes your position
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 px-6 pb-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Options */}
            <div className="grid gap-5">
              {Object.entries(roleInfo).map(([role, info]) => {
                const Icon = info.icon;
                const isSelected = selectedRole === role;
                
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role as Role)}
                    className={`
                      w-full p-6 rounded-xl border-2 text-left transition-all duration-300 group
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]' 
                        : 'border-border hover:border-primary/40 bg-card hover:bg-card-hover hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${info.iconBg} ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                        <Icon className={`w-7 h-7 ${info.color} transition-all duration-300`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                          {info.title}
                        </h3>
                        <p className="text-foreground/70 text-sm leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                          {info.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <div className="w-3 h-3 bg-primary-foreground rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <div className="pt-6">
              <Button
                onClick={handleRoleSelection}
                disabled={!selectedRole || isLoading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Setting up your account...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Continue to Dashboard
                    <Heart className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-foreground/50">
                You can change your role later in your account settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}