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
  Stethoscope,
  Eye,
  Filter,
  BarChart3,
  Users,
  TrendingUp,
  Database,
  Globe,
  UserCheck,
  AlertCircle,
  Info
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

interface ProfessionalAuditTrailProps {
  onBack?: () => void;
}

const ProfessionalAuditTrail: React.FC<ProfessionalAuditTrailProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'stats'>('timeline');

  useEffect(() => {
    loadAuditData();
  }, [currentPage, actionFilter, severityFilter, outcomeFilter, searchTerm]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
        ...(actionFilter && { action: actionFilter }),
        ...(severityFilter && { severity: severityFilter }),
        ...(outcomeFilter && { outcome: outcomeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      console.log('🔄 Loading professional audit data...');

      const [logsResponse, statsResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/audit/logs?${params}`),
        axios.get('http://localhost:3000/api/audit/stats?days=30')
      ]);

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
      setError(`Unable to load audit data. Please check your connection.`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': 
        return { 
          color: 'bg-red-50 text-red-700 border-red-200', 
          icon: <AlertCircle className="w-3 h-3" />,
          dot: 'bg-red-500' 
        };
      case 'HIGH': 
        return { 
          color: 'bg-orange-50 text-orange-700 border-orange-200', 
          icon: <AlertTriangle className="w-3 h-3" />,
          dot: 'bg-orange-500' 
        };
      case 'MEDIUM': 
        return { 
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
          icon: <Info className="w-3 h-3" />,
          dot: 'bg-yellow-500' 
        };
      case 'LOW': 
        return { 
          color: 'bg-green-50 text-green-700 border-green-200', 
          icon: <CheckCircle className="w-3 h-3" />,
          dot: 'bg-green-500' 
        };
      default: 
        return { 
          color: 'bg-gray-50 text-gray-700 border-gray-200', 
          icon: <Info className="w-3 h-3" />,
          dot: 'bg-gray-500' 
        };
    }
  };

  const getOutcomeConfig = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS': return { icon: <CheckCircle className="w-4 h-4 text-green-600" />, color: 'text-green-600' };
      case 'FAILURE': return { icon: <XCircle className="w-4 h-4 text-red-600" />, color: 'text-red-600' };
      case 'WARNING': return { icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />, color: 'text-yellow-600' };
      default: return { icon: <Clock className="w-4 h-4 text-gray-600" />, color: 'text-gray-600' };
    }
  };

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'RECORD_CREATED':
        return { icon: <FileText className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'RECORD_UPDATED':
        return { icon: <FileText className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'RECORD_APPROVED':
        return { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50' };
      case 'RECORD_REJECTED':
        return { icon: <XCircle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50' };
      case 'LOGIN':
        return { icon: <User className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'SYSTEM_ACCESS':
        return { icon: <Globe className="w-4 h-4" />, color: 'text-cyan-600', bg: 'bg-cyan-50' };
      case 'TERMINOLOGY_LOOKUP':
        return { icon: <Database className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'WHO_API_CALLED':
        return { icon: <Globe className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-50' };
      default:
        return { icon: <Activity className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeAgo = '';
    if (diffMins < 60) {
      timeAgo = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours}h ago`;
    } else {
      timeAgo = `${diffDays}d ago`;
    }

    return {
      date: date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      timeAgo,
      fullDate: date.toLocaleString('en-IN')
    };
  };

  const exportLogs = async (format: 'json' | 'csv') => {
    try {
      console.log(`📊 Exporting audit logs as ${format.toUpperCase()}...`);
      const response = await axios.post('http://localhost:3000/api/audit/export', {
        format,
        filters: {
          ...(actionFilter && { action: actionFilter }),
          ...(severityFilter && { severity: severityFilter }),
          ...(outcomeFilter && { outcome: outcomeFilter })
        }
      });
      
      console.log('✅ Export completed successfully');
    } catch (err) {
      console.error('❌ Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Audit Trail</h3>
              <p className="text-gray-600">Retrieving system activity logs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Audit Trail</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={loadAuditData} className="bg-primary hover:bg-primary/90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Loading
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Professional Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button 
                  onClick={onBack} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Audit Trail & Compliance</h1>
                  <p className="text-gray-600">Comprehensive system activity monitoring and compliance tracking</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  onClick={() => setViewMode('timeline')}
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-sm"
                >
                  <Activity className="w-4 h-4 mr-1" />
                  Timeline
                </Button>
                <Button
                  onClick={() => setViewMode('stats')}
                  variant={viewMode === 'stats' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
              </div>
              
              <Button
                onClick={() => exportLogs('csv')}
                variant="outline"
                size="sm"
                className="border-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLogs.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Activities</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsersCount}</p>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.uniquePatientsCount}</p>
                    <p className="text-sm text-gray-600">Patients Affected</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageLogsPerDay}</p>
                    <p className="text-sm text-gray-600">Daily Average</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Filters */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search activities, users, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px] border-gray-300">
                  <SelectValue placeholder="Filter by Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="RECORD_CREATED">Record Created</SelectItem>
                  <SelectItem value="RECORD_UPDATED">Record Updated</SelectItem>
                  <SelectItem value="RECORD_APPROVED">Record Approved</SelectItem>
                  <SelectItem value="RECORD_REJECTED">Record Rejected</SelectItem>
                  <SelectItem value="LOGIN">User Login</SelectItem>
                  <SelectItem value="TERMINOLOGY_LOOKUP">Terminology Lookup</SelectItem>
                  <SelectItem value="WHO_API_CALLED">WHO API Call</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px] border-gray-300">
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
              
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="w-[140px] border-gray-300">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Outcomes</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILURE">Failure</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setActionFilter('');
                  setSeverityFilter('');
                  setOutcomeFilter('');
                  setCurrentPage(1);
                }}
                variant="outline"
                size="sm"
                className="border-gray-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Activity className="w-5 h-5 text-blue-600" />
              System Activity Timeline
              <Badge variant="secondary" className="ml-2">
                {logs.length} entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
                <p className="text-gray-600">No audit logs match your current filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {logs.map((log, index) => {
                  const { date, time, timeAgo } = formatTimestamp(log.createdAt);
                  const severityConfig = getSeverityConfig(log.severity);
                  const outcomeConfig = getOutcomeConfig(log.outcome);
                  const actionConfig = getActionConfig(log.action);
                  
                  return (
                    <div key={log._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Timeline Dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full ${actionConfig.bg} flex items-center justify-center ${actionConfig.color}`}>
                            {actionConfig.icon}
                          </div>
                          {index < logs.length - 1 && (
                            <div className="w-px h-8 bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900">
                                {log.userName || 'Unknown User'}
                              </h4>
                              <Badge variant="outline" className="text-xs border-gray-300">
                                {log.userRole}
                              </Badge>
                              <Badge className={`text-xs border ${severityConfig.color}`}>
                                {severityConfig.icon}
                                <span className="ml-1">{log.severity}</span>
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              {outcomeConfig.icon}
                              <span className="font-medium">{timeAgo}</span>
                              <span>•</span>
                              <span>{time}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3 leading-relaxed">
                            {log.description}
                          </p>
                          
                          {(log.patientAbhaId || log.resourceType || log.ipAddress) && (
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              {log.patientAbhaId && (
                                <div className="flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  <span>Patient: {log.patientAbhaId}</span>
                                </div>
                              )}
                              {log.resourceType && (
                                <div className="flex items-center gap-1">
                                  <Database className="w-3 h-3" />
                                  <span>Resource: {log.resourceType}</span>
                                </div>
                              )}
                              {log.ipAddress && (
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>IP: {log.ipAddress}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {logs.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing page {currentPage} of audit entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded">
                      {currentPage}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={logs.length < 15}
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalAuditTrail;