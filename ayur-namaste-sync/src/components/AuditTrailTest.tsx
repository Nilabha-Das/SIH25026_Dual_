import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface AuditTrailTestProps {
  onBack?: () => void;
}

const AuditTrailTest: React.FC<AuditTrailTestProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack}
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Records
            </Button>
            
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Audit Trail Test</h1>
            </div>
          </div>
        </div>

        {/* Test Content */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">🧪 Audit Trail Test Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-green-500">✅ Component is loading successfully</div>
            <div className="text-blue-500">✅ CSS variables are working</div>
            <div className="text-yellow-500">✅ Icons are rendering</div>
            <div className="text-purple-500">✅ Back navigation prop received: {onBack ? 'Yes' : 'No'}</div>
            
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <h3 className="text-primary font-semibold mb-2">Test Results:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Component mounted successfully</li>
                <li>• Tailwind classes applied correctly</li>
                <li>• Dark theme working</li>
                <li>• Props passed correctly</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => {
                console.log('Test button clicked!');
                alert('Audit Trail Test - Button works!');
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Test Button
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditTrailTest;