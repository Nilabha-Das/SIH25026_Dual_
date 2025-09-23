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
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Activity,
  BarChart3,
  Eye,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

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
  userAgent?: string;
  sessionId?: string;
  complianceFlags?: {
    hipaaCompliant: boolean;
    gdprCompliant: boolean;
    indiaEhrCompliant: boolean;
  };
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  actionStats: Record<string, number>;
  severityStats: Record<string, number>;
  outcomeStats: Record<string, number>;
  userStats: Record<string, number>;
}

interface AuditTrailProps {
  onBack?: () => void;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'logs' | 'stats'>('logs');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock audit logs data
      const mockLogs: AuditLog[] = [
        {
          _id: '1',
          userId: { _id: 'user1', name: 'Dr. Ananya Sharma', email: 'ananya@hospital.in', role: 'curator' },
          userRole: 'curator',
          userName: 'Dr. Ananya Sharma',
          userEmail: 'ananya@hospital.in',
          action: 'RECORD_APPROVED',
          description: 'Medical record approved for NAMASTE code NAM001 mapped to ICD-11 XM1234 (Fever)',
          resourceType: 'MedicalRecord',
          resourceId: 'record123',
          patientAbhaId: 'ABHA001234567890',
          severity: 'MEDIUM',
          outcome: 'SUCCESS',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
          sessionId: 'session123',
          complianceFlags: {
            hipaaCompliant: true,
            gdprCompliant: true,
            indiaEhrCompliant: true
          },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          userId: { _id: 'user1', name: 'Dr. Ananya Sharma', email: 'ananya@hospital.in', role: 'curator' },
          userRole: 'curator',
          userName: 'Dr. Ananya Sharma',
          userEmail: 'ananya@hospital.in',
          action: 'RECORD_REJECTED',
          description: 'Medical record rejected - insufficient documentation for NAMASTE code NAM002',
          resourceType: 'MedicalRecord',
          resourceId: 'record124',
          patientAbhaId: 'ABHA001234567891',
          severity: 'HIGH',
          outcome: 'SUCCESS',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
          sessionId: 'session123',
          complianceFlags: {
            hipaaCompliant: true,
            gdprCompliant: true,
            indiaEhrCompliant: true
          },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: '3',
          userId: { _id: 'user2', name: 'Dr. Raj Patel', email: 'raj@hospital.in', role: 'doctor' },
          userRole: 'doctor',
          userName: 'Dr. Raj Patel',
          userEmail: 'raj@hospital.in',
          action: 'FHIR_BUNDLE_UPLOADED',
          description: 'FHIR R4 bundle uploaded with 5 resources for patient care coordination',
          resourceType: 'Bundle',
          resourceId: 'bundle125',
          patientAbhaId: 'ABHA001234567892',
          severity: 'LOW',
          outcome: 'SUCCESS',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
          sessionId: 'session124',
          complianceFlags: {
            hipaaCompliant: true,
            gdprCompliant: true,
            indiaEhrCompliant: true
          },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          _id: '4',
          userId: { _id: 'user3', name: 'System Admin', email: 'admin@hospital.in', role: 'admin' },
          userRole: 'admin',
          userName: 'System Admin',
          userEmail: 'admin@hospital.in',
          action: 'WHO_API_CALLED',
          description: 'WHO ICD-11 API called for entity validation - Pneumonia classification',
          resourceType: 'TerminologyCode',
          resourceId: 'who456',
          severity: 'LOW',
          outcome: 'SUCCESS',
          ipAddress: '192.168.1.200',
          userAgent: 'System/1.0',
          sessionId: 'system_session',
          complianceFlags: {
            hipaaCompliant: true,
            gdprCompliant: true,
            indiaEhrCompliant: true
          },
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          updatedAt: new Date(Date.now() - 10800000).toISOString()
        },
        {
          _id: '5',
          userId: { _id: 'user1', name: 'Dr. Ananya Sharma', email: 'ananya@hospital.in', role: 'curator' },
          userRole: 'curator',
          userName: 'Dr. Ananya Sharma',
          userEmail: 'ananya@hospital.in',
          action: 'LOGIN',
          description: 'Curator logged into the NAMASTE system',
          resourceType: 'User',
          severity: 'LOW',
          outcome: 'SUCCESS',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
          sessionId: 'session123',
          complianceFlags: {
            hipaaCompliant: true,
            gdprCompliant: true,
            indiaEhrCompliant: true
          },
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          createdAt: new Date(Date.now() - 14400000).toISOString(),
          updatedAt: new Date(Date.now() - 14400000).toISOString()
        }
      ];

      // Mock stats data
      const mockStats: AuditStats = {
        totalLogs: 245,
        todayLogs: 12,
        thisWeekLogs: 67,
        thisMonthLogs: 245,
        actionStats: {
          'RECORD_APPROVED': 89,
          'RECORD_REJECTED': 23,
          'FHIR_BUNDLE_UPLOADED': 45,
          'WHO_API_CALLED': 34,
          'LOGIN': 54
        },
        severityStats: {
          'LOW': 156,
          'MEDIUM': 67,
          'HIGH': 20,
          'CRITICAL': 2
        },
        outcomeStats: {
          'SUCCESS': 235,
          'FAILURE': 8,
          'WARNING': 2
        },
        userStats: {
          'Dr. Ananya Sharma': 145,
          'Dr. Raj Patel': 67,
          'Dr. Priya Singh': 23,
          'System Admin': 10
        }
      };

      setLogs(mockLogs);
      setStats(mockStats);
      setLoading(false);
    } catch (err) {
      console.error('Error loading mock data:', err);
      setError('Failed to load audit data. Please try again.');
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'LOW':
        return <AlertTriangle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILURE':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILURE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === '' || log.action === actionFilter;
    const matchesSeverity = severityFilter === '' || log.severity === severityFilter;
    
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const exportLogs = (format: 'json' | 'csv') => {
    const dataToExport = filteredLogs.map(log => ({
      timestamp: formatTimestamp(log.timestamp),
      user: log.userName,
      role: log.userRole,
      action: log.action,
      description: log.description,
      severity: log.severity,
      outcome: log.outcome,
      patientId: log.patientAbhaId || 'N/A',
      resourceType: log.resourceType || 'N/A',
      ipAddress: log.ipAddress || 'N/A'
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = Object.keys(dataToExport[0] || {}).join(',');
      const csvData = dataToExport.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      const csv = `${headers}\n${csvData}`;
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-white">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg">Loading audit trail...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-white">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Audit Trail</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={loadMockData} variant="outline" className="text-white border-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button 
                onClick={onBack} 
                variant="outline" 
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-400" />
                Audit Trail & Compliance
              </h1>
              <p className="text-gray-300 mt-1">
                Comprehensive system audit logs and compliance monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentView('logs')}
              variant={currentView === 'logs' ? 'default' : 'outline'}
              size="sm"
              className={currentView === 'logs' ? '' : 'text-white border-white/20 hover:bg-white/10'}
            >
              <FileText className="w-4 h-4 mr-2" />
              Logs
            </Button>
            <Button
              onClick={() => setCurrentView('stats')}
              variant={currentView === 'stats' ? 'default' : 'outline'}
              size="sm"
              className={currentView === 'stats' ? '' : 'text-white border-white/20 hover:bg-white/10'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </Button>
          </div>
        </div>
      </div>

      {currentView === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-cyan-400" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Actions</SelectItem>
                      <SelectItem value="RECORD_APPROVED">Record Approved</SelectItem>
                      <SelectItem value="RECORD_REJECTED">Record Rejected</SelectItem>
                      <SelectItem value="FHIR_BUNDLE_UPLOADED">FHIR Bundle Upload</SelectItem>
                      <SelectItem value="WHO_API_CALLED">WHO API Call</SelectItem>
                      <SelectItem value="LOGIN">User Login</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Severities</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => exportLogs('json')} 
                    variant="outline" 
                    size="sm"
                    className="text-white border-gray-600 hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button 
                    onClick={() => exportLogs('csv')} 
                    variant="outline" 
                    size="sm"
                    className="text-white border-gray-600 hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Audit Logs ({filteredLogs.length})
                </span>
                <Button 
                  onClick={loadMockData} 
                  variant="outline" 
                  size="sm"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log._id}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(log.severity)}
                            <Badge variant="outline" className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {getOutcomeIcon(log.outcome)}
                            <Badge variant="outline" className={getOutcomeColor(log.outcome)}>
                              {log.outcome}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            {log.action}
                          </Badge>
                        </div>
                        
                        <p className="text-white text-sm mb-2">{log.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-300">
                          <div>
                            <span className="text-gray-400">User:</span> {log.userName}
                          </div>
                          <div>
                            <span className="text-gray-400">Role:</span> {log.userRole}
                          </div>
                          {log.patientAbhaId && (
                            <div>
                              <span className="text-gray-400">Patient ID:</span> {log.patientAbhaId}
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">IP:</span> {log.ipAddress}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                        {log.complianceFlags && (
                          <div className="mt-1 flex gap-1">
                            {log.complianceFlags.indiaEhrCompliant && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                India EHR
                              </Badge>
                            )}
                            {log.complianceFlags.hipaaCompliant && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                HIPAA
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found matching your criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentView === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Logs</span>
                  <span className="text-2xl font-bold text-white">{stats.totalLogs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Today</span>
                  <span className="text-xl font-semibold text-green-400">{stats.todayLogs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">This Week</span>
                  <span className="text-xl font-semibold text-blue-400">{stats.thisWeekLogs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">This Month</span>
                  <span className="text-xl font-semibold text-purple-400">{stats.thisMonthLogs}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                Actions Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.actionStats).map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{action.replace('_', ' ')}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Severity Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-cyan-400" />
                Severity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.severityStats).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(severity)}
                      <span className="text-gray-300 text-sm">{severity}</span>
                    </div>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outcome Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                Outcome Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.outcomeStats).map(([outcome, count]) => (
                  <div key={outcome} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getOutcomeIcon(outcome)}
                      <span className="text-gray-300 text-sm">{outcome}</span>
                    </div>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <Card className="bg-gray-800/50 border-gray-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stats.userStats).map(([user, count]) => (
                  <div key={user} className="flex justify-between items-center">
                    <span className="text-gray-300">{user}</span>
                    <span className="text-white font-semibold">{count} actions</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;