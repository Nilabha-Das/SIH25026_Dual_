import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface AuthCallbackProps {
  onLogin: (user: any) => void;
}

export function AuthCallback({ onLogin }: AuthCallbackProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        setTimeout(() => {
          navigate('/login?error=' + error);
        }, 2000);
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Check if user needs to complete role selection
          if (!user.hasCompletedRoleSelection) {
            // Redirect to role selection page with token and user data
            setTimeout(() => {
              navigate(`/select-role?token=${token}&user=${encodeURIComponent(userParam)}`);
            }, 1500);
            return;
          }
          
          // Save to localStorage for users who have completed role selection
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Call the login handler
          onLogin(user);
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          
        } catch (err) {
          console.error('Failed to parse user data:', err);
          setTimeout(() => {
            navigate('/login?error=parse_error');
          }, 2000);
        }
      } else {
        console.error('Missing token or user data');
        setTimeout(() => {
          navigate('/login?error=missing_data');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, onLogin]);

  const error = searchParams.get('error');
  const hasTokenAndUser = searchParams.get('token') && searchParams.get('user');
  
  // Check if user needs role selection
  let needsRoleSelection = false;
  try {
    const userParam = searchParams.get('user');
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      needsRoleSelection = !user.hasCompletedRoleSelection;
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          {error ? (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                Authentication Failed
              </h2>
              <p className="text-center text-muted-foreground mb-4">
                {error === 'oauth_failed' && 'OAuth authentication was cancelled or failed.'}
                {error === 'server_error' && 'Server error occurred during authentication.'}
                {error === 'parse_error' && 'Failed to process authentication data.'}
                {error === 'missing_data' && 'Authentication data is missing.'}
                {!['oauth_failed', 'server_error', 'parse_error', 'missing_data'].includes(error) && 
                  'An unknown error occurred.'}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </>
          ) : hasTokenAndUser ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Authentication Successful!
              </h2>
              <p className="text-center text-muted-foreground mb-4">
                {needsRoleSelection 
                  ? "Please select your role to continue."
                  : "You have been successfully logged in."
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {needsRoleSelection 
                  ? "Redirecting to role selection..."
                  : "Redirecting to dashboard..."
                }
              </p>
            </>
          ) : (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Processing Authentication...
              </h2>
              <p className="text-center text-muted-foreground">
                Please wait while we complete your sign-in.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}