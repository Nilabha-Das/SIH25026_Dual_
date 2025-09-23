import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, RefreshCw, AlertTriangle } from 'lucide-react';

interface AuditTrailDebugProps {
  onBack?: () => void;
}

const AuditTrailDebug: React.FC<AuditTrailDebugProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log('🐛 Debug:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('Component mounted, starting data load...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      addDebugInfo('Setting loading to true');
      setLoading(true);
      setError(null);
      
      addDebugInfo('Simulating data load...');
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addDebugInfo('Data loaded successfully, setting loading to false');
      setLoading(false);
      
    } catch (err) {
      addDebugInfo(`Error occurred: ${err}`);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  addDebugInfo(`Render: loading=${loading}, error=${error}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-lg">Loading audit trail...</span>
            </div>
          </div>
          
          {/* Debug Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>🐛 Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm font-mono">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-muted-foreground">{info}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Audit Trail</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button 
                onClick={onBack} 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Audit Trail Debug</h1>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              ✅ Audit Trail Loaded Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-success/10 p-4 rounded-lg border border-success/20">
              <h3 className="text-success font-semibold mb-2">Success! Component working correctly:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Component mounted and rendered</li>
                <li>• Loading state handled properly</li>
                <li>• Data loading simulation completed</li>
                <li>• CSS and styling applied correctly</li>
                <li>• Back navigation available: {onBack ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            {/* Debug Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">🐛 Debug Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm font-mono max-h-40 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="text-muted-foreground">{info}</div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => {
                addDebugInfo('Manual refresh triggered');
                loadData();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              🔄 Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditTrailDebug;