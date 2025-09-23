import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function RoleSelectionDebug() {
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    
    let parsedUser = null;
    try {
      parsedUser = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;
    } catch (e) {
      console.error('Failed to parse user param:', e);
    }

    setDebugInfo({
      token: token || 'Not found',
      userParam: userParam || 'Not found',
      parsedUser,
      urlParams: Object.fromEntries(searchParams.entries())
    });
  }, [searchParams]);

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch('http://localhost:3000/select-role-test');
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        backendConnection: {
          success: true,
          data,
          status: response.status
        }
      }));
    } catch (error) {
      console.error('Backend connection test failed:', error);
      setTestResults(prev => ({
        ...prev,
        backendConnection: {
          success: false,
          error: error.message
        }
      }));
    }
  };

  const testRoleSelectionEndpoint = async () => {
    const token = searchParams.get('token');
    
    if (!token) {
      setTestResults(prev => ({
        ...prev,
        roleSelection: {
          success: false,
          error: 'No token available'
        }
      }));
      return;
    }

    try {
      console.log('Testing role selection endpoint...');
      const response = await fetch('http://localhost:3000/select-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          role: 'doctor' // Test role
        })
      });

      const responseText = await response.text();
      console.log('Role selection response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { rawResponse: responseText };
      }

      setTestResults(prev => ({
        ...prev,
        roleSelection: {
          success: response.ok,
          status: response.status,
          data,
          rawResponse: responseText
        }
      }));
    } catch (error) {
      console.error('Role selection test failed:', error);
      setTestResults(prev => ({
        ...prev,
        roleSelection: {
          success: false,
          error: error.message
        }
      }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Role Selection Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">URL Parameters</h3>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>

            <div className="flex gap-4">
              <Button onClick={testBackendConnection} variant="outline">
                Test Backend Connection
              </Button>
              <Button onClick={testRoleSelectionEndpoint} variant="outline">
                Test Role Selection Endpoint
              </Button>
            </div>

            {Object.keys(testResults).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Test Results</h3>
                <div className="space-y-4">
                  {testResults.backendConnection && (
                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {testResults.backendConnection.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">Backend Connection</span>
                      </div>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(testResults.backendConnection, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResults.roleSelection && (
                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {testResults.roleSelection.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">Role Selection Endpoint</span>
                      </div>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(testResults.roleSelection, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}