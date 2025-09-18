import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { PatientRecord, getConfidenceLevel } from '@/lib/mockData';

interface ProblemListProps {
  records: PatientRecord[];
  showActions?: boolean;
  onDownloadSummary?: () => void;
}

export function ProblemList({ records, showActions = false, onDownloadSummary }: ProblemListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-error" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/20 text-success border-success/30';
      case 'pending': return 'bg-warning/20 text-warning border-warning/30';
      case 'rejected': return 'bg-error/20 text-error border-error/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Medical Records</h3>
              <p className="text-muted-foreground">Diagnosis and treatment history</p>
            </div>
          </div>
          
          {showActions && onDownloadSummary && (
            <Button
              onClick={onDownloadSummary}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Summary
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Records Yet</h4>
            <p className="text-muted-foreground">Medical records will appear here once added by healthcare providers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div 
                key={record.id} 
                className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {record.diagnosisName}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      
                      {record.onsetDate && (
                        <div>
                          Onset: {new Date(record.onsetDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                      
                      {record.severity && (
                        <Badge 
                          className={
                            record.severity === 'Severe' ? 'bg-error/20 text-error border-error/30' :
                            record.severity === 'Moderate' ? 'bg-warning/20 text-warning border-warning/30' :
                            'bg-info/20 text-info border-info/30'
                          }
                        >
                          {record.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <Badge className={getStatusVariant(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* ICD Mapping */}
                {record.mappedIcdCode && (
                  <div className="bg-muted/20 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-foreground mb-1">ICD-11 Mapping</p>
                    <p className="text-sm text-muted-foreground font-mono">{record.mappedIcdCode}</p>
                  </div>
                )}

                {/* Prescription */}
                <div className="bg-primary/5 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-foreground mb-1">Prescription</p>
                  <p className="text-sm text-muted-foreground">{record.prescription}</p>
                </div>

                {/* Notes */}
                {record.notes && (
                  <div className="bg-accent/5 p-3 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Clinical Notes</p>
                    <p className="text-sm text-muted-foreground">{record.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}