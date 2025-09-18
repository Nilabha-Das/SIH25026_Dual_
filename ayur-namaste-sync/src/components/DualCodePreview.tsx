import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { NAMASTECode, ICD11Code, getConfidenceLevel } from '@/lib/mockData';

interface DualCodePreviewProps {
  namasteCode: NAMASTECode;
  icdMappings: Array<{
    icdCode: ICD11Code;
    confidence: number;
    module: 'MMS' | 'TM2';
  }>;
  onSelectMapping?: (icdCode: string, module: 'MMS' | 'TM2') => void;
}

export function DualCodePreview({ namasteCode, icdMappings, onSelectMapping }: DualCodePreviewProps) {
  const getConfidenceIcon = (confidence: number) => {
    const level = getConfidenceLevel(confidence);
    switch (level) {
      case 'high': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'low': return <XCircle className="w-4 h-4 text-error" />;
    }
  };

  const getConfidenceClass = (confidence: number) => {
    const level = getConfidenceLevel(confidence);
    switch (level) {
      case 'high': return 'confidence-high';
      case 'medium': return 'confidence-medium';
      case 'low': return 'confidence-low';
    }
  };

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Dual Code Preview</h3>
            <p className="text-muted-foreground">NAMASTE to ICD-11 Mappings</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* NAMASTE Code Section */}
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-accent text-accent-foreground">NAMASTE</Badge>
            <h4 className="font-semibold text-foreground">{namasteCode.display}</h4>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Code:</strong> {namasteCode.code}</p>
            <p><strong>System:</strong> {namasteCode.system}</p>
            {namasteCode.synonyms && (
              <p><strong>Synonyms:</strong> {namasteCode.synonyms}</p>
            )}
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* ICD-11 Mappings */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">ICD-11 Mappings</h4>
          
          {icdMappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No ICD-11 mappings found for this NAMASTE code</p>
            </div>
          ) : (
            icdMappings.map((mapping, index) => (
              <div 
                key={index}
                className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                  onSelectMapping ? 'hover:border-primary' : ''
                }`}
                onClick={() => onSelectMapping?.(mapping.icdCode.code, mapping.module)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        className={mapping.module === 'TM2' ? 
                          'bg-primary text-primary-foreground' : 
                          'bg-secondary text-secondary-foreground'
                        }
                      >
                        ICD-11 {mapping.module}
                      </Badge>
                      <h5 className="font-medium text-foreground">{mapping.icdCode.title}</h5>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Code:</strong> {mapping.icdCode.code}</p>
                      {mapping.icdCode.description && (
                        <p><strong>Description:</strong> {mapping.icdCode.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {getConfidenceIcon(mapping.confidence)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceClass(mapping.confidence)}`}>
                      {Math.round(mapping.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Module Information */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Module:</span> {
                    mapping.module === 'TM2' ? 
                    'Traditional Medicine Conditions' : 
                    'Mortality and Morbidity Statistics'
                  }
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}