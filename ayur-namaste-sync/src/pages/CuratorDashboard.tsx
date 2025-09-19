import { SidebarProvider } from '@/components/ui/sidebar';
import { Layout } from '@/components/Layout';
import { AppSidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Stethoscope, UserCheck, AlertTriangle, User as UserIcon, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '@/lib/mockData';
import axios from 'axios';

interface CuratorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function CuratorDashboard({ user, onLogout }: CuratorDashboardProps) {
  // Medical Records Review State
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [reviewingRecord, setReviewingRecord] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<{[key: string]: string}>({});

  // Medical Records Functions
  const fetchPendingRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await axios.get('http://localhost:3000/api/curator/pending-records');
      setPendingRecords(response.data);
    } catch (error) {
      console.error('Error fetching pending records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleRecordReview = async (patientId: string, recordId: string, decision: 'approved' | 'rejected') => {
    setReviewingRecord(recordId);
    try {
      const notes = reviewNotes[recordId] || '';
      console.log(`Reviewing record: patientId=${patientId}, recordId=${recordId}, decision=${decision}`);
      
      const response = await axios.post(`http://localhost:3000/api/curator/${patientId}/records/${recordId}/review`, {
        decision,
        notes
      });
      
      console.log('Review response:', response.data);
      
      // Remove the reviewed record from the list
      setPendingRecords(prev => prev.filter(record => record._id !== recordId));
      
      // Clear the notes for this record
      setReviewNotes(prev => {
        const updated = { ...prev };
        delete updated[recordId];
        return updated;
      });
      
      console.log(`Record ${decision} successfully`);
    } catch (error) {
      console.error(`Error ${decision} record:`, error);
      console.error('Error details:', error.response?.data);
    } finally {
      setReviewingRecord(null);
    }
  };

  const updateReviewNotes = (recordId: string, notes: string) => {
    setReviewNotes(prev => ({ ...prev, [recordId]: notes }));
  };

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  return (
    <Layout>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar userRole="curator" />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar user={user} onLogout={onLogout} />
            <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-full">
              <div className="max-w-7xl mx-auto w-full">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Medical Records Review</h1>
                  <p className="text-gray-600 mt-1 text-sm">Review and approve medical records submitted by doctors</p>
                </div>
                {pendingRecords.length > 0 && (
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {pendingRecords.length} Pending
                  </Badge>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{pendingRecords.length}</p>
                      <p className="text-muted-foreground">Pending Review</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">127</p>
                      <p className="text-muted-foreground">Approved Today</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">15</p>
                      <p className="text-muted-foreground">Active Doctors</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Pending Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRecords ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading pending records...</span>
                    </div>
                  ) : pendingRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-600">No pending medical records to review at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRecords.map((record) => (
                        <div key={record._id} className="border rounded-lg p-4 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                          {/* Patient & Doctor Info */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {record.patientName?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg">{record.patientName || 'Unknown Patient'}</h4>
                                <p className="text-sm text-gray-600">ABHA ID: {record.patientAbhaId}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <UserIcon className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Dr. {record.doctorId?.name || 'Unknown'}</span>
                                  <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                                  <span className="text-sm text-gray-600">
                                    {new Date(record.submittedAt || record.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          </div>

                          {/* Medical Information */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border-l-4 border-amber-400">
                              <h5 className="font-semibold text-amber-900 mb-2">Problem Diagnosed</h5>
                              <p className="font-medium text-gray-900">{record.namasteTerm}</p>
                              <p className="text-sm text-gray-600 font-mono">Code: {record.namasteCode}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border-l-4 border-green-400">
                              <h5 className="font-semibold text-green-900 mb-2">ICD-11 Mapping</h5>
                              <p className="font-medium text-gray-900">{record.icdTerm}</p>
                              <p className="text-sm text-gray-600 font-mono">Code: {record.icdCode}</p>
                            </div>
                          </div>

                          {/* Prescription */}
                          {record.prescription && (
                            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
                              <h5 className="font-semibold text-blue-900 mb-2">Prescription</h5>
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                                {record.prescription}
                              </pre>
                            </div>
                          )}

                          {/* Review Notes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Review Notes (Optional)
                            </label>
                            <Textarea
                              value={reviewNotes[record._id] || ''}
                              onChange={(e) => updateReviewNotes(record._id, e.target.value)}
                              placeholder="Add any notes about this medical record review..."
                              className="min-h-[80px]"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={() => handleRecordReview(record.patientId, record._id, 'approved')}
                              disabled={reviewingRecord === record._id}
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            >
                              {reviewingRecord === record._id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRecordReview(record.patientId, record._id, 'rejected')}
                              disabled={reviewingRecord === record._id}
                              variant="destructive"
                              className="flex items-center gap-2"
                            >
                              {reviewingRecord === record._id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </Button>
                            <Button
                              onClick={() => fetchPendingRecords()}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Refresh
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
}