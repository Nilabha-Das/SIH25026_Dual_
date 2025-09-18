import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock } from "lucide-react";
import { Layout } from "@/components/Layout";

interface LoginPageProps {
  onLogin: (user: any) => void;
  isAuthenticated: boolean;
}

type Role = "patient" | "doctor" | "curator";

export function LoginPage({ onLogin, isAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [abhaId, setAbhaId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // ✅ Already logged in → go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // ---------- REGISTER ----------
  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, abhaId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    onLogin(data.user);

    navigate("/dashboard");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

  // ---------- LOGIN ----------
 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    onLogin(data.user);

    navigate("/dashboard");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary animate-pulse-glow" />
            </div>
            <h1 className="medical-heading text-3xl mb-2">AYUSH EMR</h1>
            <p className="text-muted-foreground">
              Secure login to your medical records portal
            </p>
          </div>

          {/* FORM CARD */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {mode === "login"
                      ? "Enter your credentials"
                      : "Provide details to register"}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {mode === "register" ? (
                // ---------- REGISTER FORM ----------
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="medical-input mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="medical-input mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="medical-input mt-2"
                    />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <div className="flex gap-2 mt-2">
                      {["patient", "doctor", "curator"].map((r) => (
                        <Button
                          key={r}
                          type="button"
                          variant={role === r ? undefined : "outline"}
                          onClick={() => setRole(r as Role)}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="btn-medical w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Create Account"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setMode("login")}
                    >
                      Already have an account? Sign in
                    </Button>
                  </div>
                </form>
              ) : (
                // ---------- LOGIN FORM ----------
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="medical-input mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="medical-input mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="abha">ABHA ID (optional)</Label>
                    <Input
                      id="abha"
                      type="text"
                      placeholder="ABHA-xxxx-xxxx"
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      className="medical-input mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Patients: enter ABHA if required after first registration.
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="btn-medical w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Signing in..."
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" />
                          Sign In
                        </div>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setMode("register")}
                    >
                      Create new account
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Your data is stored locally in your browser for demo purposes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
