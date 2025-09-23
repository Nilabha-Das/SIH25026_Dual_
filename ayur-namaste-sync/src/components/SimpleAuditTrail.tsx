import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Shield,
  RefreshCw,
  AlertTriangle,
  Search,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Activity,
  Stethoscope
} from 'lucide-react';
import axios from 'axios';

interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  userRole: string;
  userName: string;
  userEmail: string;
  action: string;
  description: string;
  resourceType?: string;
  resourceId?: string;
  patientAbhaId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  ipAddress?: string;
  timestamp?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditStats {
  totalLogs: number;
  uniqueUsersCount: number;
  uniquePatientsCount: number;
  averageLogsPerDay: number;
  actions: Record<string, number>;
  severity: Record<string, number>;
  outcomes: Record<string, number>;
}

interface SimpleAuditTrailProps {
  onBack?: () => void;
}

const SimpleAuditTrail: React.FC<SimpleAuditTrailProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAuditData();
  }, [currentPage, actionFilter, severityFilter, searchTerm]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(actionFilter && { action: actionFilter }),
        ...(severityFilter && { severity: severityFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      console.log('🔄 Fetching audit logs from:', `http://localhost:3000/api/audit/logs?${params}`);

      // Fetch logs and stats in parallel
      const [logsResponse, statsResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/audit/logs?${params}`),
        axios.get('http://localhost:3000/api/audit/stats?days=30')
      ]);

      console.log('✅ Audit logs loaded:', logsResponse.data.logs?.length || 0);
      console.log('✅ Audit stats loaded:', statsResponse.data);

      setLogs(logsResponse.data.logs || []);
      setStats({
        totalLogs: statsResponse.data.summary?.totalLogs || 0,
        uniqueUsersCount: statsResponse.data.summary?.uniqueUsersCount || 0,
        uniquePatientsCount: statsResponse.data.summary?.uniquePatientsCount || 0,
        averageLogsPerDay: statsResponse.data.summary?.averageLogsPerDay || 0,
        actions: statsResponse.data.breakdowns?.actions || {},
        severity: statsResponse.data.breakdowns?.severity || {},
        outcomes: statsResponse.data.breakdowns?.outcomes || {}
      });
      
    } catch (err: any) {
      console.error('❌ Error loading audit data:', err);
      setError(`Failed to load audit data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAILURE': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'RECORD_CREATED':
      case 'RECORD_UPDATED':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'RECORD_APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'RECORD_REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'LOGIN':
      case 'SYSTEM_ACCESS':
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const exportLogs = async (format: 'json' | 'csv') => {
    try {
      const response = await axios.post('http://localhost:3000/api/audit/export', {
        format,
        filters: {
          ...(actionFilter && { action: actionFilter }),
          ...(severityFilter && { severity: severityFilter })
        }
      });
      
      console.log('✅ Export successful');
      // The download will be handled by the browser
    } catch (err) {
      console.error('❌ Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-lg">Loading audit trail...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Audit Trail</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAuditData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button 
                onClick={onBack} 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Audit Trail & Activity History</h1>
                <p className="text-sm text-muted-foreground">
                  Track all doctor activities and system changes
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => exportLogs('csv')}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => exportLogs('json')}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalLogs}</p>
                    <p className="text-sm text-muted-foreground">Total Activities</p>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.uniqueUsersCount}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.uniquePatientsCount}</p>
                    <p className="text-sm text-muted-foreground">Patients Affected</p>
                  </div>
                  <Stethoscope className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.averageLogsPerDay}</p>
                    <p className="text-sm text-muted-foreground">Daily Average</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="RECORD_CREATED">Record Created</SelectItem>
                  <SelectItem value="RECORD_UPDATED">Record Updated</SelectItem>
                  <SelectItem value="RECORD_APPROVED">Record Approved</SelectItem>
                  <SelectItem value="RECORD_REJECTED">Record Rejected</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setActionFilter('');
                  setSeverityFilter('');
                  setCurrentPage(1);
                }}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No audit logs found</p>
                </div>
              ) : (
                logs.map((log) => {
                  const { date, time } = formatTimestamp(log.createdAt);
                  return (
                    <div key={log._id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-foreground">
                              {log.userName || 'Unknown User'}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {log.userRole}
                            </Badge>
                            <Badge className={`text-xs ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getOutcomeIcon(log.outcome)}
                            <span>{date}</span>
                            <span>{time}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {log.description}
                        </p>
                        
                        {(log.patientAbhaId || log.resourceType) && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {log.patientAbhaId && (
                              <span>Patient: {log.patientAbhaId}</span>
                            )}
                            {log.resourceType && (
                              <span>Resource: {log.resourceType}</span>
                            )}
                            {log.ipAddress && (
                              <span>IP: {log.ipAddress}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {logs.length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {currentPage}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={logs.length < 20}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleAuditTrail;