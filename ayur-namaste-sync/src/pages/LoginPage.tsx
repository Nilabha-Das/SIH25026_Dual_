// import { useState } from "react";
// import { Navigate, useNavigate } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Heart, Mail, Lock } from "lucide-react";
// import { Layout } from "@/components/Layout";

// interface LoginPageProps {
//   onLogin: (user: any) => void;
//   isAuthenticated: boolean;
// }

// type Role = "patient" | "doctor" | "curator";

// export function LoginPage({ onLogin, isAuthenticated }: LoginPageProps) {
//   const [mode, setMode] = useState<"login" | "register">("login");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [role, setRole] = useState<Role>("patient");
//   const [abhaId, setAbhaId] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const navigate = useNavigate();

//   // ✅ Already logged in → go to dashboard
//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   // ---------- REGISTER ----------
//   const handleRegister = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError(null);

//   try {
//     const res = await fetch("http://localhost:3000/api/auth/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, email, password, role, abhaId }),
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Registration failed");

//     localStorage.setItem("user", JSON.stringify(data.user));
//     localStorage.setItem("token", data.token);
//     onLogin(data.user);

//     navigate("/dashboard");
//   } catch (err: any) {
//     setError(err.message);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // ---------- LOGIN ----------
//  const handleLogin = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError(null);

//   try {
//     const res = await fetch("http://localhost:3000/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Login failed");

//     localStorage.setItem("user", JSON.stringify(data.user));
//     localStorage.setItem("token", data.token);
//     onLogin(data.user);

//     navigate("/dashboard");
//   } catch (err: any) {
//     setError(err.message);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   return (
//     <Layout>
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <div className="w-full max-w-md">
//           {/* HEADER */}
//           <div className="text-center mb-8">
//             <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
//               <Heart className="w-10 h-10 text-primary animate-pulse-glow" />
//             </div>
//             <h1 className="medical-heading text-3xl mb-2">AYUSH EMR</h1>
//             <p className="text-muted-foreground">
//               Secure login to your medical records portal
//             </p>
//           </div>

//           {/* FORM CARD */}
//           <Card className="medical-card">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
//                   <Mail className="w-4 h-4 text-primary" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold">
//                     {mode === "login" ? "Sign In" : "Create Account"}
//                   </h2>
//                   <p className="text-muted-foreground text-sm">
//                     {mode === "login"
//                       ? "Enter your credentials"
//                       : "Provide details to register"}
//                   </p>
//                 </div>
//               </CardTitle>
//             </CardHeader>

//             <CardContent className="space-y-6">
//               {mode === "register" ? (
//                 // ---------- REGISTER FORM ----------
//                 <form onSubmit={handleRegister} className="space-y-4">
//                   <div>
//                     <Label htmlFor="name">Full Name</Label>
//                     <Input
//                       id="name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       required
//                       className="medical-input mt-2"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       className="medical-input mt-2"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="password">Password</Label>
//                     <Input
//                       id="password"
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       className="medical-input mt-2"
//                     />
//                   </div>

//                   <div>
//                     <Label>Role</Label>
//                     <div className="flex gap-2 mt-2">
//                       {["patient", "doctor", "curator"].map((r) => (
//                         <Button
//                           key={r}
//                           type="button"
//                           variant={role === r ? undefined : "outline"}
//                           onClick={() => setRole(r as Role)}
//                         >
//                           {r.charAt(0).toUpperCase() + r.slice(1)}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>

//                   {error && <p className="text-sm text-red-500">{error}</p>}

//                   <div className="space-y-2">
//                     <Button
//                       type="submit"
//                       className="btn-medical w-full"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? "Registering..." : "Create Account"}
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full"
//                       onClick={() => setMode("login")}
//                     >
//                       Already have an account? Sign in
//                     </Button>
//                   </div>
//                 </form>
//               ) : (
//                 // ---------- LOGIN FORM ----------
//                 <form onSubmit={handleLogin} className="space-y-4">
//                   <div>
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       className="medical-input mt-2"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="password">Password</Label>
//                     <Input
//                       id="password"
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       className="medical-input mt-2"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="abha">ABHA ID (optional)</Label>
//                     <Input
//                       id="abha"
//                       type="text"
//                       placeholder="ABHA-xxxx-xxxx"
//                       value={abhaId}
//                       onChange={(e) => setAbhaId(e.target.value)}
//                       className="medical-input mt-2"
//                     />
//                     <p className="text-xs text-muted-foreground mt-1">
//                       Patients: enter ABHA if required after first registration.
//                     </p>
//                   </div>

//                   {error && <p className="text-sm text-red-500">{error}</p>}

//                   <div className="space-y-2">
//                     <Button
//                       type="submit"
//                       className="btn-medical w-full"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? (
//                         "Signing in..."
//                       ) : (
//                         <div className="flex items-center justify-center gap-2">
//                           <Lock className="w-4 h-4" />
//                           Sign In
//                         </div>
//                       )}
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full"
//                       onClick={() => setMode("register")}
//                     >
//                       Create new account
//                     </Button>
//                   </div>
//                 </form>
//               )}
//             </CardContent>
//           </Card>

//           <div className="mt-6 text-center">
//             <p className="text-xs text-muted-foreground">
//               Your data is stored locally in your browser for demo purposes.
//             </p>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// =============================
import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  // ✅ Already logged in → go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle OAuth errors from URL params
  const oauthError = searchParams.get('error');
  const errorEmail = searchParams.get('email');
  const existingProvider = searchParams.get('provider');
  
  if (oauthError && !error) {
    const errorMessages = {
      'oauth_failed': 'OAuth authentication failed. Please try again.',
      'oauth_cancelled': 'OAuth authentication was cancelled. You can try again.',
      'server_error': 'Server error occurred during authentication.',
      'parse_error': 'Failed to process authentication data.',
      'missing_data': 'Authentication data is missing.',
      'account_exists': errorEmail && existingProvider ? 
        `An account with ${errorEmail} already exists using ${existingProvider} login. Please sign in with your ${existingProvider} account instead.` :
        'An account with this email already exists. Please use your original login method.'
    };
    setError(errorMessages[oauthError as keyof typeof errorMessages] || 'An unknown error occurred.');
  }

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/google';
  };

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
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-background">
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
            {/* OAuth Error Display */}
            {oauthError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Authentication failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Google OAuth Button */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 h-12"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

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
  );
}
