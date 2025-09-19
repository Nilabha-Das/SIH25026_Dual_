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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approved Medical Records</h3>
              <p className="text-gray-600">Curator-approved diagnosis and treatment history</p>
            </div>
          </div>
          
          {onDownloadSummary && (
            <Button
              onClick={onDownloadSummary}
              variant="outline"
              size="sm"
              className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Approved Records Yet</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Your medical records will appear here once they have been reviewed and approved by our medical curators. 
              This ensures the accuracy and quality of your medical information.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record) => (
              <div 
                key={record.id} 
                className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{record.namasteTerm}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
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
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NAMASTE Diagnosis */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-l-4 border-amber-400">
                      <h5 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">🩺</span>
                        NAMASTE Diagnosis
                      </h5>
                      <p className="text-lg font-semibold text-amber-900">{record.namasteTerm}</p>
                      <p className="text-sm text-amber-700 font-mono mt-1">{record.namasteCode}</p>
                    </div>

                    {/* ICD-11 Mapping */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🏥</span>
                        ICD-11 Mapping
                      </h5>
                      <p className="text-lg font-semibold text-blue-900">{record.icdTerm}</p>
                      <p className="text-sm text-blue-700 font-mono mt-1">{record.icdCode}</p>
                    </div>
                  </div>

                  {/* Prescription */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-400">
                    <h5 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">💊</span>
                      Prescription & Treatment
                    </h5>
                    <div className="bg-white rounded p-3 border border-purple-200">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                        {record.prescription}
                      </pre>
                    </div>
                  </div>

                  {/* Healthcare Team */}
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Healthcare Team
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Treating Doctor</p>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{record.doctorName}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">{record.doctorEmail}</p>
                      </div>
                      {record.curatorName && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Approved by Curator</p>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-900">{record.curatorName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Curator Notes */}
                  {record.curatorNotes && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Curator Review Notes
                      </h5>
                      <p className="text-sm text-green-800">{record.curatorNotes}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Treatment Timeline
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Record Created:</span>
                        <span className="font-medium">{new Date(record.submittedAt).toLocaleString()}</span>
                      </div>
                      {record.approvedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">Approved:</span>
                          <span className="font-medium">{new Date(record.approvedAt).toLocaleString()}</span>
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