import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';

interface AuditDebugProps {
  onBack?: () => void;
}

const AuditDebug: React.FC<AuditDebugProps> = ({ onBack }) => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addDebug = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🐛 ${message}`);
  };

  useEffect(() => {
    addDebug('AuditDebug component mounted successfully');
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    addDebug('Testing API connection...');
    
    try {
      // Test backend health first
      addDebug('Testing backend server...');
      const healthResponse = await fetch('http://localhost:3000/api/audit/logs?limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      addDebug(`Backend response status: ${healthResponse.status}`);
      addDebug(`Backend response ok: ${healthResponse.ok}`);
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        addDebug(`Data structure: ${Object.keys(data).join(', ')}`);
        addDebug(`Logs count: ${data.logs?.length || 0}`);
        
        if (data.logs && data.logs.length > 0) {
          addDebug(`First log user: ${data.logs[0].userName}`);
          addDebug(`First log action: ${data.logs[0].action}`);
        }
        
        setTestData(data);
        addDebug('✅ API connection and data retrieval successful!');
      } else {
        const errorText = await healthResponse.text();
        addDebug(`❌ API Error: ${healthResponse.status} ${healthResponse.statusText}`);
        addDebug(`Error details: ${errorText.substring(0, 200)}`);
      }
    } catch (error) {
      addDebug(`❌ Network Error: ${error.message}`);
      addDebug(`Error type: ${error.name}`);
      addDebug('Check if backend server is running on port 3000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              onClick={() => {
                addDebug('Back button clicked');
                onBack();
              }} 
              variant="ghost" 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Audit Trail Debug</h1>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm">Component Rendered</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? <RefreshCw className="w-6 h-6 animate-spin mx-auto" /> : '🌐'}
                </div>
                <div className="text-sm">API Connection</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {testData ? '✅' : '⏳'}
                </div>
                <div className="text-sm">Data Loaded</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Log */}
        <Card>
          <CardHeader>
            <CardTitle>🐛 Debug Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={testApiConnection}
                disabled={loading}
                size="sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Test API Again
              </Button>
              
              <Button 
                onClick={() => {
                  setDebugInfo([]);
                  addDebug('Debug log cleared');
                }}
                variant="outline"
                size="sm"
              >
                Clear Log
              </Button>
              
              {testData && testData.logs && testData.logs.length > 0 && (
                <Button 
                  onClick={() => {
                    addDebug('API is working! You can now switch to professional component.');
                    alert('✅ API is working! The professional audit trail should work now. Let me know if you want to switch to it.');
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  ✅ API Works - Ready for Professional View
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Data Display */}
        {testData && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Test Data Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Total Logs:</strong> {testData.logs?.length || 0}
                  </div>
                  <div>
                    <strong>Response Status:</strong> ✅ Success
                  </div>
                  <div>
                    <strong>Has Pagination:</strong> {testData.pagination ? '✅ Yes' : '❌ No'}
                  </div>
                  <div>
                    <strong>Data Type:</strong> {Array.isArray(testData.logs) ? 'Array' : 'Object'}
                  </div>
                </div>
                
                {testData.logs && testData.logs.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">📋 Sample Log Entry:</h4>
                    <div className="bg-gray-100 p-3 rounded-lg text-sm">
                      <div><strong>User:</strong> {testData.logs[0].userName || 'N/A'}</div>
                      <div><strong>Action:</strong> {testData.logs[0].action || 'N/A'}</div>
                      <div><strong>Description:</strong> {testData.logs[0].description || 'N/A'}</div>
                      <div><strong>Timestamp:</strong> {testData.logs[0].createdAt || 'N/A'}</div>
                    </div>
                  </div>
                )}
                
                <details className="border rounded-lg">
                  <summary className="p-3 cursor-pointer bg-gray-50 rounded-t-lg">
                    🔍 View Full JSON Response (Click to expand)
                  </summary>
                  <div className="p-3">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-96">
{JSON.stringify(testData, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Current URL:</strong> {window.location.href}
              </div>
              <div>
                <strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
              </div>
              <div>
                <strong>Viewport:</strong> {window.innerWidth} x {window.innerHeight}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date().toISOString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditDebug;