import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Info, Activity, Stethoscope } from 'lucide-react';

interface ThreeLayerMappingProps {
  namasteCode: {
    code: string;
    display: string;
    system: string;
  };
  onSelect?: (mapping: any) => void;
  selectedMapping?: any;
}

interface LayerMapping {
  // Layer 1: NAMASTE
  namasteCode: string;
  namasteDisplay: string;
  
  // Layer 2: TM2
  tm2Code: string;
  tm2Title: string;
  tm2Confidence: number;
  tm2Details?: {
    traditionalSystem: string;
    therapeuticArea: string;
    patternType: string;
    description: string;
  };
  traditionalSystem: string;
  
  // Layer 3: ICD-11
  icdCode: string;
  icdTitle: string;
  icdConfidence: number;
  icdDetails?: any;
  
  // Overall
  overallConfidence: number;
  mappingType: string;
}

export function ThreeLayerMappingVisualization({ namasteCode, onSelect, selectedMapping }: ThreeLayerMappingProps) {
  const [mappings, setMappings] = useState<LayerMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tm2Stats, setTm2Stats] = useState<any>(null);

  useEffect(() => {
    if (namasteCode?.code) {
      fetchThreeLayerMappings();
      fetchTM2Statistics();
    }
  }, [namasteCode]);

  const fetchThreeLayerMappings = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching three-layer mappings for:', namasteCode.code);
      const response = await fetch(`http://localhost:3000/api/mapping/namaste/${namasteCode.code}`);
      const data = await response.json();
      console.log('Three-layer mapping data:', data);
      setMappings(data);
    } catch (error) {
      console.error('Error fetching three-layer mappings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTM2Statistics = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tm2/stats/overview');
      const stats = await response.json();
      setTm2Stats(stats);
    } catch (error) {
      console.error('Error fetching TM2 statistics:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const getTraditionalSystemIcon = (system: string) => {
    switch (system) {
      case 'Ayurveda': return '🕉️';
      case 'Siddha': return '⚗️';
      case 'Unani': return '🌿';
      case 'Homeopathy': return '💊';
      default: return '🔬';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            Loading Three-Layer Architecture...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mappings.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Three-Layer Mapping Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No three-layer mappings found for this NAMASTE code</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Architecture Overview */}
      <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Stethoscope className="w-5 h-5" />
            Three-Layer Mapping Architecture
          </CardTitle>
          <p className="text-sm text-blue-700">
            NAMASTE Traditional → TM2 Bridge → ICD-11 Biomedical
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-center flex-1">
              <div className="text-2xl mb-1">🏥</div>
              <div className="font-semibold text-sm">Layer 1</div>
              <div className="text-xs text-muted-foreground">NAMASTE</div>
              <div className="text-xs text-muted-foreground">Traditional</div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-500" />
            <div className="text-center flex-1">
              <div className="text-2xl mb-1">🌿</div>
              <div className="font-semibold text-sm">Layer 2</div>
              <div className="text-xs text-muted-foreground">TM2 Module</div>
              <div className="text-xs text-muted-foreground">Bridge</div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-500" />
            <div className="text-center flex-1">
              <div className="text-2xl mb-1">🔬</div>
              <div className="font-semibold text-sm">Layer 3</div>
              <div className="text-xs text-muted-foreground">ICD-11 MMS</div>
              <div className="text-xs text-muted-foreground">Biomedical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TM2 Statistics */}
      {tm2Stats && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm">TM2 Module Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{tm2Stats.totalCodes}</div>
                <div className="text-xs text-muted-foreground">Total Codes</div>
              </div>
              {tm2Stats.systemStats.slice(0, 3).map((stat: any, index: number) => (
                <div key={index}>
                  <div className="text-lg font-bold text-green-600">{stat.count}</div>
                  <div className="text-xs text-muted-foreground">{stat._id}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Three-Layer Mappings */}
      <div className="space-y-3">
        {mappings.map((mapping, index) => (
          <Card 
            key={index} 
            className={`w-full cursor-pointer transition-all hover:shadow-md ${
              selectedMapping === mapping ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onSelect?.(mapping)}
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Header with Overall Confidence */}
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">Three-Layer Mapping #{index + 1}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getConfidenceColor(mapping.overallConfidence)} text-xs`}>
                      {getConfidenceLabel(mapping.overallConfidence)} Confidence
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(mapping.overallConfidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                {/* Three Layers Visualization */}
                <div className="space-y-3">
                  {/* Layer 1: NAMASTE */}
                  <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          1
                        </div>
                        <div>
                          <div className="font-semibold text-amber-900">NAMASTE Traditional</div>
                          <div className="text-lg font-bold text-gray-900">{mapping.namasteDisplay}</div>
                          <div className="text-sm text-amber-700 font-mono">{mapping.namasteCode}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTraditionalSystemIcon(mapping.traditionalSystem)}</span>
                        <Badge variant="outline" className="text-xs">
                          {mapping.traditionalSystem}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Down */}
                  <div className="flex justify-center">
                    <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
                  </div>

                  {/* Layer 2: TM2 */}
                  <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          2
                        </div>
                        <div>
                          <div className="font-semibold text-green-900">TM2 Traditional Bridge</div>
                          <div className="text-lg font-bold text-gray-900">{mapping.tm2Title}</div>
                          <div className="text-sm text-green-700 font-mono">{mapping.tm2Code}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getConfidenceColor(mapping.tm2Confidence)} text-xs`}>
                          {(mapping.tm2Confidence * 100).toFixed(0)}%
                        </Badge>
                        {mapping.tm2Details?.therapeuticArea && (
                          <Badge variant="outline" className="text-xs">
                            {mapping.tm2Details.therapeuticArea}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow Down */}
                  <div className="flex justify-center">
                    <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
                  </div>

                  {/* Layer 3: ICD-11 */}
                  <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                        <div>
                          <div className="font-semibold text-blue-900">ICD-11 MMS Biomedical</div>
                          <div className="text-lg font-bold text-gray-900">{mapping.icdTitle}</div>
                          <div className="text-sm text-blue-700 font-mono">{mapping.icdCode}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getConfidenceColor(mapping.icdConfidence)} text-xs`}>
                          {(mapping.icdConfidence * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          MMS
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(mapping);
                    }}
                  >
                    Use This Three-Layer Mapping
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}