import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Download, 
  User as UserIcon, 
  Stethoscope,
  Shield,
  Clock
} from 'lucide-react';

interface ApprovedRecord {
  id: string;
  patientName: string;
  patientAbhaId: string;
  doctorName: string;
  doctorEmail: string;
  curatorName?: string;
  namasteCode: string;
  namasteTerm: string;
  tm2Code?: string;
  tm2Title?: string;
  icdCode: string;
  icdTerm: string;
  prescription: string;
  date: string;
  submittedAt: string;
  approvedAt?: string;
  curatorNotes?: string;
  status: string;
}

interface ApprovedRecordsListProps {
  records: ApprovedRecord[];
  onDownloadSummary?: () => void;
}

export function ApprovedRecordsList({ records, onDownloadSummary }: ApprovedRecordsListProps) {
  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Approved Medical Records</h3>
              <p className="text-muted-foreground">Curator-approved diagnosis and treatment history</p>
            </div>
          </div>
          
          {onDownloadSummary && (
            <Button
              onClick={onDownloadSummary}
              variant="outline"
              size="sm"
              className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
              disabled={records.length === 0}
            >
              <Download className="w-4 h-4" />
              {records.length === 0 ? 'No Records to Download' : `Download PDF Summary (${records.length} records)`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">No Approved Records Yet</h4>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your medical records will appear here once they have been reviewed and approved by our medical curators. 
              This ensures the accuracy and quality of your medical information.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record) => (
              <div 
                key={record.id} 
                className="medical-card hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{record.namasteTerm}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                          {record.approvedAt && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              <span>Approved {new Date(record.approvedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Professional Three-Layer Medical Architecture Display */}
                  <div className="space-y-6">
                    {/* Architecture Overview */}
                    <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                      <h4 className="text-lg font-semibold text-foreground mb-2">Three-Layer Medical Semantic Mapping</h4>
                      <p className="text-sm text-muted-foreground">Traditional Medicine → Bridge Layer → International Standard</p>
                    </div>

                    {/* Layer Cards - Professional Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Layer 1: NAMASTE Traditional System */}
                      <div className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-secondary/15 to-secondary/5 rounded-xl p-6 border-2 border-secondary/30 hover:border-secondary/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-secondary-foreground font-bold text-sm">L1</span>
                          </div>
                          <div>
                            <h5 className="font-bold text-secondary-foreground text-lg">NAMASTE</h5>
                            <p className="text-xs text-secondary/70 uppercase tracking-wide">Traditional Medicine</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xl font-bold text-foreground leading-tight">{record.namasteTerm}</p>
                            <p className="text-sm text-muted-foreground font-mono bg-secondary/10 px-2 py-1 rounded mt-2 inline-block">
                              {record.namasteCode}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-secondary text-sm">
                            <div className="w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center">
                              🌿
                            </div>
                            <span className="font-medium">Ayurvedic Classification</span>
                          </div>
                        </div>
                      </div>

                      {/* Layer 2: TM2 Bridge Layer */}
                      <div className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-warning/15 to-warning/5 rounded-xl p-6 border-2 border-warning/30 hover:border-warning/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-warning rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-warning-foreground font-bold text-sm">L2</span>
                          </div>
                          <div>
                            <h5 className="font-bold text-warning-foreground text-lg">TM2 Bridge</h5>
                            <p className="text-xs text-warning/70 uppercase tracking-wide">Semantic Layer</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xl font-bold text-foreground leading-tight">
                              {record.tm2Title || 'Traditional Medicine Pattern'}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono bg-warning/10 px-2 py-1 rounded mt-2 inline-block">
                              {record.tm2Code || 'TM2-BRIDGE'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-warning text-sm">
                            <div className="w-4 h-4 rounded-full bg-warning/20 flex items-center justify-center">
                              🔗
                            </div>
                            <span className="font-medium">Semantic Bridge</span>
                          </div>
                        </div>
                      </div>

                      {/* Layer 3: ICD-11 International Standard */}
                      <div className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-info/15 to-info/5 rounded-xl p-6 border-2 border-info/30 hover:border-info/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-info rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">L3</span>
                          </div>
                          <div>
                            <h5 className="font-bold text-info-foreground text-lg">ICD-11</h5>
                            <p className="text-xs text-info/70 uppercase tracking-wide">WHO Standard</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xl font-bold text-foreground leading-tight">{record.icdTerm}</p>
                            <p className="text-sm text-muted-foreground font-mono bg-info/10 px-2 py-1 rounded mt-2 inline-block">
                              {record.icdCode}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-info text-sm">
                            <div className="w-4 h-4 rounded-full bg-info/20 flex items-center justify-center">
                              🏥
                            </div>
                            <span className="font-medium">International Standard</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Three-Layer Architecture Visualization */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">⚡</span>
                      </div>
                      Three-Layer Mapping Architecture
                    </h5>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/20 rounded-lg border border-secondary/30">
                        <span className="text-secondary font-mono text-sm">{record.namasteCode}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <div className="w-6 h-px bg-primary"></div>
                        <span className="text-xs">→</span>
                        <div className="w-6 h-px bg-primary"></div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-warning/20 rounded-lg border border-warning/30">
                        <span className="text-warning font-mono text-sm">{record.tm2Code || 'TM2-XXX'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <div className="w-6 h-px bg-primary"></div>
                        <span className="text-xs">→</span>
                        <div className="w-6 h-px bg-primary"></div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-info/20 rounded-lg border border-info/30">
                        <span className="text-info font-mono text-sm">{record.icdCode}</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      NAMASTE → TM2 → ICD-11 semantic mapping flow
                    </p>
                  </div>

                  {/* Prescription */}
                  <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg p-4 border border-accent/30">
                    <h5 className="font-semibold text-accent-foreground mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-accent-foreground text-xs">💊</span>
                      </div>
                      Prescription & Treatment Plan
                    </h5>
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                        {record.prescription}
                      </pre>
                    </div>
                  </div>

                  {/* Healthcare Team */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary" />
                      Healthcare Team
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Treating Doctor</p>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">{record.doctorName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">{record.doctorEmail}</p>
                      </div>
                      {record.curatorName && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Approved by Curator</p>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-success" />
                            <span className="font-medium text-foreground">{record.curatorName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Curator Notes */}
                  {record.curatorNotes && (
                    <div className="bg-success/10 rounded-lg p-4 border border-success/30">
                      <h5 className="font-semibold text-success-foreground mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-success" />
                        Curator Review Notes
                      </h5>
                      <p className="text-sm text-foreground">{record.curatorNotes}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Treatment Timeline
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">Record Created:</span>
                        <span className="font-medium text-foreground">{new Date(record.submittedAt).toLocaleString()}</span>
                      </div>
                      {record.approvedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <span className="text-muted-foreground">Approved:</span>
                          <span className="font-medium text-foreground">{new Date(record.approvedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}