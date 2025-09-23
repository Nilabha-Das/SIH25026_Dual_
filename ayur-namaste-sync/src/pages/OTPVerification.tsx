import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Mail, Shield, Clock, RefreshCw, CheckCircle } from "lucide-react";

interface OTPVerificationProps {
  onLogin: (user: any) => void;
}

export function OTPVerification({ onLogin }: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [maskedEmail, setMaskedEmail] = useState("");
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const requiresRole = searchParams.get('requiresRole') === 'true';

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Automatically send OTP when component loads
    sendOTP();
  }, [token, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format countdown display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Send OTP
  const sendOTP = async () => {
    if (!token) return;
    
    try {
      const res = await fetch("http://localhost:3000/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        setMaskedEmail(data.email || "your email");
        setSuccess("OTP sent successfully! Check your email.");
        setError(null);
        setTimeLeft(300); // Reset timer
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError("Network error. Please check your connection.");
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!token) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      const res = await fetch("http://localhost:3000/api/otp/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("New OTP sent successfully!");
        setTimeLeft(300); // Reset timer
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err: any) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !otp) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("http://localhost:3000/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        // Store user data and token
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        onLogin(data.user);
        
        // Redirect based on whether role selection is needed
        if (requiresRole) {
          navigate("/role-selection");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input (auto-format and limit to 6 digits)
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="medical-heading text-3xl mb-2">Email Verification</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* VERIFICATION CARD */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Verify Your Email</h2>
                <p className="text-muted-foreground text-sm">
                  Code sent to {maskedEmail}
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Countdown Timer */}
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Code expires in</span>
                <span className="font-mono font-bold text-primary">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={handleOTPChange}
                  placeholder="Enter 6-digit code"
                  className="medical-input mt-2 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="btn-medical w-full"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      Verify Code
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOTP}
                  disabled={isResending || timeLeft > 240} // Can resend after 1 minute
                >
                  {isResending ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </div>
                  ) : timeLeft > 240 ? (
                    `Resend in ${formatTime(timeLeft - 240)}`
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      Resend Code
                    </div>
                  )}
                </Button>
              </div>
            </form>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Didn't receive the email?</p>
              <ul className="text-xs space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure {maskedEmail} is correct</li>
                <li>• Wait a few minutes for delivery</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}