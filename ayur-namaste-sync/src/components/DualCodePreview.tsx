import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { NAMASTECode, ICD11Code, getConfidenceLevel } from '@/lib/mockData';

interface DualCodePreviewProps {
  namasteCode: NAMASTECode;
  icdMappings: Array<{
    code: string;
    title: string;
    confidence: number;
    module: 'MMS' | 'TM2';
    // Three-layer architecture fields
    tm2Code?: string;
    tm2Title?: string;
    tm2Confidence?: number;
    traditionalSystem?: string;
    // Legacy support
    icdCode?: ICD11Code;
  }>;
  onSelectMapping?: (icdCode: string, module: 'MMS' | 'TM2') => void;
  showThreeLayer?: boolean;
}

export function DualCodePreview({ namasteCode, icdMappings, onSelectMapping, showThreeLayer = true }: DualCodePreviewProps) {
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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center medical-button">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {showThreeLayer ? 'Three-Layer Architecture' : 'Dual Code Preview'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {showThreeLayer ? 'NAMASTE → TM2 → ICD-11 MMS Mappings' : 'NAMASTE to ICD-11 Mappings'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* NAMASTE Code Section */}
        <div className="p-4 bg-card border border-border rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <Badge className="medical-button text-xs px-2 py-1">NAMASTE</Badge>
            <h4 className="font-semibold text-foreground">{namasteCode.display}</h4>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium">Code:</span> 
              <span className="font-mono bg-muted px-2 py-1 rounded text-foreground">{namasteCode.code}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium">System:</span> 
              <span className="text-foreground">{namasteCode.system}</span>
            </div>
            {namasteCode.synonyms && (
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium">Synonyms:</span> 
                <span className="text-foreground">{namasteCode.synonyms}</span>
              </div>
            )}
          </div>
        </div>

        {/* Three-Layer Mappings */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">
            {showThreeLayer ? 'Three-Layer Architecture Mappings' : 'ICD-11 Mappings'}
          </h4>

          {icdMappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No {showThreeLayer ? 'three-layer' : 'ICD-11'} mappings found for this NAMASTE code</p>
            </div>
          ) : (
            icdMappings.map((mapping, index) => (
              <div
                key={index}
                className={`border rounded-lg transition-all cursor-pointer hover:shadow-md ${onSelectMapping ? 'hover:border-primary' : ''
                  }`}
                onClick={() => onSelectMapping?.(mapping.code, mapping.module)}
              >
                {showThreeLayer && mapping.tm2Code ? (
                  // Three-Layer Architecture View: NAMASTE → TM2 → ICD-11
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h5 className="text-lg font-semibold text-foreground mb-3">Three-Layer Mapping Flow</h5>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">NAMASTE</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span className="text-secondary">TM2</span>
                        <ArrowRight className="w-4 h-4 text-secondary" />
                        <span className="text-info">ICD-11 MMS</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Traditional Medicine → Bridge → Biomedical Standard</p>
                    </div>

                    {/* Three-Layer Flow */}
                    <div className="flex items-stretch justify-center gap-4">
                      {/* Layer 1: NAMASTE Code */}
                      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-primary/30 text-center shadow-lg hover:border-primary/50 transition-all">
                        <Badge className="medical-button text-xs mb-3">NAMASTE</Badge>
                        <div className="font-semibold text-foreground text-sm mb-3">{namasteCode.display}</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-center">
                            <span className="bg-primary/20 text-primary px-2 py-1 rounded font-mono">{namasteCode.code}</span>
                          </div>
                          <div className="text-muted-foreground">{namasteCode.system}</div>
                        </div>
                      </div>

                      {/* Arrow 1 */}
                      <div className="flex flex-col items-center justify-center px-2">
                        <ArrowRight className="w-6 h-6 text-primary mb-1" />
                        <span className="text-xs text-primary font-medium">maps to</span>
                      </div>

                      {/* Layer 2: TM2 Bridge */}
                      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-secondary/30 text-center shadow-lg hover:border-secondary/50 transition-all">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Badge className="wisdom-button text-xs">TM2</Badge>
                          {mapping.traditionalSystem && (
                            <Badge variant="outline" className="text-xs border-secondary/50 text-secondary">
                              {mapping.traditionalSystem}
                            </Badge>
                          )}
                        </div>
                        <div className="font-semibold text-foreground text-sm mb-3">{mapping.tm2Title}</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-center">
                            <span className="bg-secondary/20 text-secondary px-2 py-1 rounded font-mono">{mapping.tm2Code}</span>
                          </div>
                          {mapping.tm2Confidence && (
                            <div className="text-muted-foreground">
                              Confidence: <span className="text-secondary">{Math.round(mapping.tm2Confidence * 100)}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow 2 */}
                      <div className="flex flex-col items-center justify-center px-2">
                        <ArrowRight className="w-6 h-6 text-secondary mb-1" />
                        <span className="text-xs text-secondary font-medium">maps to</span>
                      </div>

                      {/* Layer 3: ICD-11 MMS */}
                      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-info/30 text-center shadow-lg hover:border-info/50 transition-all">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Badge className="bg-info text-info-foreground text-xs">ICD-11</Badge>
                          <Badge variant="outline" className="text-xs border-info/50 text-info">{mapping.module}</Badge>
                        </div>
                        <div className="font-semibold text-foreground text-sm mb-3">{mapping.title}</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-center">
                            <span className="bg-info/20 text-info px-2 py-1 rounded font-mono">{mapping.code}</span>
                          </div>
                          <div className="text-muted-foreground">{mapping.module} (Biomedical)</div>
                          <div className="flex items-center justify-center gap-1">
                            {getConfidenceIcon(mapping.confidence)}
                            <span className="text-info font-medium">{Math.round(mapping.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mapping Summary */}
                    <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg shadow-inner">
                      <div className="text-center">
                        <h6 className="text-sm font-semibold text-foreground mb-3">Complete Mapping Path</h6>
                        <div className="text-xs font-mono bg-card/50 border border-border rounded p-3 text-foreground">
                          <span className="text-primary">{namasteCode.code}</span>
                          <span className="text-muted-foreground"> (NAMASTE) </span>
                          <ArrowRight className="w-3 h-3 inline mx-1 text-primary" />
                          <span className="text-secondary">{mapping.tm2Code}</span>
                          <span className="text-muted-foreground"> (TM2) </span>
                          <ArrowRight className="w-3 h-3 inline mx-1 text-secondary" />
                          <span className="text-info">{mapping.code}</span>
                          <span className="text-muted-foreground"> (ICD-11 {mapping.module})</span>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          <span className="text-primary">Traditional Medicine</span> → 
                          <span className="text-secondary"> Standardized Bridge</span> → 
                          <span className="text-info"> International Standard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Traditional Dual View
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            className={mapping.module === 'TM2' ? 'wisdom-button' : 'medical-button'}
                          >
                            ICD-11 {mapping.module}
                          </Badge>
                          <h5 className="font-semibold text-foreground">{mapping.title}</h5>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-medium">Code:</span>
                            <span className="bg-card border border-border px-2 py-1 rounded font-mono text-foreground">{mapping.code}</span>
                          </div>
                          {mapping.tm2Title && (
                            <div className="flex items-center gap-2">
                              <span className="text-secondary font-medium">TM2 Bridge:</span>
                              <span className="text-foreground">{mapping.tm2Title}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          {getConfidenceIcon(mapping.confidence)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceClass(mapping.confidence)}`}>
                            {Math.round(mapping.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Module Information */}
                    <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-primary">Module:</span> 
                        <span className="ml-2 text-foreground">{
                          mapping.module === 'TM2' ?
                            'Traditional Medicine Conditions' :
                            'Mortality and Morbidity Statistics'
                        }</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}