import { SidebarProvider } from '@/components/ui/sidebar';
import { Layout } from '@/components/Layout';
import { AppSidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { User, mockMappings, mockNAMASTECodes, mockICD11Codes, getConfidenceLevel } from '@/lib/mockData';

interface CuratorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function CuratorDashboard({ user, onLogout }: CuratorDashboardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMapping, setEditMapping] = useState<any>(null);
  const [mappings, setMappings] = useState(mockMappings);

  const [editForm, setEditForm] = useState({
    namasteCode: '',
    icdCode: '',
    module: '',
  });

  const handleApprove = (mappingId: string) => {
    alert(`Mapping ${mappingId} approved`);
  };

  const handleReject = (mappingId: string) => {
    alert(`Mapping ${mappingId} rejected`);
  };

  const handleEdit = (mapping: any) => {
    setEditMapping(mapping);
    setEditForm({
      namasteCode: mapping.namasteCode,
      icdCode: mapping.icdCode,
      module: mapping.module,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    setMappings((prev) => prev.map((m) =>
      m.id === editMapping.id
        ? {
            ...m,
            namasteCode: editForm.namasteCode,
            icdCode: editForm.icdCode,
            module: editForm.module as 'MMS' | 'TM2',
          }
        : m
    ));
    setEditModalOpen(false);
    setEditMapping(null);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditMapping(null);
  };

  return (
    <Layout>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar userRole="curator" />
          <div className="flex-1 flex flex-col">
            <TopBar user={user} onLogout={onLogout} />
            <main className="flex-1 p-6 space-y-6">
              <Card className="medical-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    NAMASTE-ICD11 Mapping Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mappings.map((mapping) => {
                      const namasteCode = mockNAMASTECodes.find(n => n.code === mapping.namasteCode);
                      const icdCode = mockICD11Codes.find(i => i.code === mapping.icdCode);
                      const confidenceLevel = getConfidenceLevel(mapping.confidence);
                      
                      return (
                        <div key={mapping.id} className="p-4 border border-border rounded-lg">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                            <div>
                              <p className="font-medium text-foreground">{namasteCode?.display}</p>
                              <p className="text-sm text-muted-foreground">{mapping.namasteCode}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium text-foreground">{icdCode?.title}</p>
                              <p className="text-sm text-muted-foreground">{mapping.icdCode}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`
                                ${confidenceLevel === 'high' ? 'confidence-high' : 
                                  confidenceLevel === 'medium' ? 'confidence-medium' : 'confidence-low'}
                              `}>
                                {Math.round(mapping.confidence * 100)}%
                              </Badge>
                              <Badge variant="outline">{mapping.module}</Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-success text-white hover:bg-success/80"
                                onClick={() => handleApprove(mapping.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReject(mapping.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(mapping)}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    {/* Edit Modal */}
    {editModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Edit Mapping</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">NAMASTE Code</label>
              <select
                name="namasteCode"
                value={editForm.namasteCode}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1"
              >
                {mockNAMASTECodes.map((n) => (
                  <option key={n.code} value={n.code}>{n.display} ({n.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ICD11 Code</label>
              <select
                name="icdCode"
                value={editForm.icdCode}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1"
              >
                {mockICD11Codes.map((i) => (
                  <option key={i.code} value={i.code}>{i.title} ({i.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Module</label>
              <select
                name="module"
                value={editForm.module}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="MMS">MMS</option>
                <option value="TM2">TM2</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button size="sm" variant="outline" onClick={handleEditCancel}>Cancel</Button>
            <Button size="sm" className="bg-primary text-white" onClick={handleEditSave}>Save</Button>
          </div>
        </div>
      </div>
    )}
    </Layout>
  );
}