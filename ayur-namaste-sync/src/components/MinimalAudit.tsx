import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface MinimalAuditProps {
  onBack?: () => void;
}

const MinimalAudit: React.FC<MinimalAuditProps> = ({ onBack }) => {
  console.log('🐛 MinimalAudit component rendered!');
  
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              onClick={() => {
                console.log('🐛 Back button clicked');
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
            <h1 className="text-2xl font-bold">Minimal Audit Trail Test</h1>
          </div>
        </div>

        {/* Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Component Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                ✅ Component is rendering successfully!
              </div>
              
              <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
                ✅ CSS styles are working!
              </div>
              
              <div className="p-4 bg-purple-100 text-purple-800 rounded-lg">
                ✅ Props received: onBack = {onBack ? 'Function provided' : 'No function'}
              </div>
              
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                🔍 Check browser console for debug messages
              </div>
              
              <Button 
                onClick={() => {
                  console.log('🐛 Test button clicked!');
                  alert('Minimal audit component is working!');
                }}
                className="w-full"
              >
                🧪 Test Button
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>🐛 Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>• Component mounted at: {new Date().toLocaleTimeString()}</div>
              <div>• Environment: {process.env.NODE_ENV || 'development'}</div>
              <div>• Current URL: {window.location.href}</div>
              <div>• User Agent: {navigator.userAgent.slice(0, 50)}...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MinimalAudit;