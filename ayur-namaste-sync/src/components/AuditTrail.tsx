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
  RefreshCw
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
  createdAt: string;
  formattedTimestamp?: string;
  previousState?: any;
  newState?: any;
  errorMessage?: string;
  namasteCodes?: Array<{ code: string; system: string; confidence?: number }>;
  icdCodes?: Array<{ code: string; system: string; version?: string }>;
}

interface AuditStats {
  period: string;
  summary: {
    totalLogs: number;
    uniqueUsersCount: number;
    uniquePatientsCount: number;
    averageLogsPerDay: number;
  };
  breakdowns: {
    actions: Record<string, number>;
    severity: Record<string, number>;
    outcomes: Record<string, number>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    userName: string;
    severity: string;
    outcome: string;
    createdAt: string;
    formattedTime: string;
  }>;
}

interface AuditTrailProps {
  className?: string;
  onBack?: () => void;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ className = '', onBack }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    outcome: '',
    resourceType: '',
    search: '',
    startDate: '',
    endDate: '',
    patientAbhaId: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  // View state
  const [view, setView] = useState<'logs' | 'stats'>('logs');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch audit logs
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`http://localhost:3000/api/audit/logs?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/audit/stats?days=30');

      if (!response.ok) {
        throw new Error('Failed to fetch audit statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch audit stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadMockData();
  }, []);

  // Load mock data for testing
  const loadMockData = () => {
    setLoading(true);
    setError(null);
    
    // Mock audit logs data
    const mockLogs = [
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
        severity: 'MEDIUM' as const,
        outcome: 'SUCCESS' as const,
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
        severity: 'HIGH' as const,
        outcome: 'SUCCESS' as const,
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
        severity: 'LOW' as const,
        outcome: 'SUCCESS' as const,
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
        severity: 'LOW' as const,
        outcome: 'SUCCESS' as const,
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
        severity: 'LOW' as const,
        outcome: 'SUCCESS' as const,
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
      period: 'Last 30 days',
      summary: {
        totalLogs: 245,
        uniqueUsersCount: 8,
        uniquePatientsCount: 45,
        averageLogsPerDay: 8.2
      },
      breakdowns: {
        actions: {
          'RECORD_APPROVED': 89,
          'RECORD_REJECTED': 23,
          'FHIR_BUNDLE_UPLOADED': 45,
          'WHO_API_CALLED': 34,
          'LOGIN': 54
        },
        severity: {
          'LOW': 156,
          'MEDIUM': 67,
          'HIGH': 20,
          'CRITICAL': 2
        },
        outcomes: {
          'SUCCESS': 235,
          'FAILURE': 8,
          'WARNING': 2
        }
      },
      recentActivity: mockLogs.slice(0, 5).map(log => ({
        id: log._id,
        action: log.action,
        description: log.description,
        userName: log.userName,
        severity: log.severity,
        outcome: log.outcome,
        createdAt: log.createdAt,
        formattedTime: new Date(log.createdAt).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
    };

    setLogs(mockLogs);
    setStats(mockStats);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: mockLogs.length,
      itemsPerPage: 20,
      hasNextPage: false,
      hasPrevPage: false
    });
    setLoading(false);
  };

  // Apply filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadMockData(); // Use mock data instead of API call
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      severity: '',
      outcome: '',
      resourceType: '',
      search: '',
      startDate: '',
      endDate: '',
      patientAbhaId: ''
    });
    // Re-load with cleared filters
    setTimeout(() => loadMockData(), 100);
  };

  // Export logs
  const exportLogs = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch('/api/audit/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          format,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          )
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Export failed');
    }
  };

  // Severity color mapping
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Outcome icon mapping
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAILURE': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Action icon mapping
  const getActionIcon = (action: string) => {
    if (action.includes('RECORD')) return <FileText className="w-4 h-4" />;
    if (action.includes('LOGIN')) return <User className="w-4 h-4" />;
    if (action.includes('SYSTEM')) return <Database className="w-4 h-4" />;
    if (action.includes('EXPORT')) return <Download className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Audit Trail & Compliance Logs
          </h2>
          <p className="text-gray-400 mt-1">
            Complete audit trail compliant with India EHR Standards 2016, HIPAA, and GDPR
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setView(view === 'logs' ? 'stats' : 'logs')}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            {view === 'logs' ? (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Stats
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                View Logs
              </>
            )}
          </Button>
          
          <Button
            onClick={() => loadMockData()}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-800 bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'stats' ? (
        // Statistics View
        <div className="space-y-6">
          {stats && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Logs</p>
                        <p className="text-2xl font-bold text-white">{stats.summary.totalLogs}</p>
                      </div>
                      <FileText className="w-8 h-8 text-cyan-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Unique Users</p>
                        <p className="text-2xl font-bold text-white">{stats.summary.uniqueUsersCount}</p>
                      </div>
                      <User className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Patients Affected</p>
                        <p className="text-2xl font-bold text-white">{stats.summary.uniquePatientsCount}</p>
                      </div>
                      <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Daily Average</p>
                        <p className="text-2xl font-bold text-white">{stats.summary.averageLogsPerDay}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Actions Breakdown */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Actions Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(stats.breakdowns.actions).map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{action}</span>
                        <Badge variant="outline" className="border-gray-700 text-gray-300">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Severity Breakdown */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Severity Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(stats.breakdowns.severity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <Badge className={getSeverityColor(severity)}>
                          {severity}
                        </Badge>
                        <span className="text-sm text-gray-300">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Outcomes Breakdown */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Outcomes Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(stats.breakdowns.outcomes).map(([outcome, count]) => (
                      <div key={outcome} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getOutcomeIcon(outcome)}
                          <span className="text-sm text-gray-300">{outcome}</span>
                        </div>
                        <span className="text-sm text-gray-300">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Recent Activity (Last 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                        {getActionIcon(activity.action)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{activity.description}</p>
                          <p className="text-xs text-gray-400">
                            {activity.userName} • {activity.formattedTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(activity.severity)}>
                            {activity.severity}
                          </Badge>
                          {getOutcomeIcon(activity.outcome)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      ) : (
        // Logs View
        <div className="space-y-6">
          {/* Filters */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Input
                  placeholder="Search descriptions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />

                <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="RECORD_APPROVED">Record Approved</SelectItem>
                    <SelectItem value="RECORD_REJECTED">Record Rejected</SelectItem>
                    <SelectItem value="RECORD_CREATED">Record Created</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="DATA_EXPORT">Data Export</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.outcome} onValueChange={(value) => handleFilterChange('outcome', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Outcomes</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILURE">Failure</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />

                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={applyFilters} className="bg-cyan-600 hover:bg-cyan-700">
                  <Search className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline" className="border-gray-700 text-gray-300">
                  Clear All
                </Button>
                <div className="ml-auto flex gap-2">
                  <Button 
                    onClick={() => exportLogs('json')} 
                    variant="outline" 
                    className="border-gray-700 text-gray-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button 
                    onClick={() => exportLogs('csv')} 
                    variant="outline" 
                    className="border-gray-700 text-gray-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Audit Logs ({pagination.totalItems} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="ml-2 text-gray-400">Loading audit logs...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        {getOutcomeIcon(log.outcome)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{log.action}</span>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          {log.patientAbhaId && (
                            <Badge variant="outline" className="border-blue-700 text-blue-400">
                              {log.patientAbhaId}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 truncate">{log.description}</p>
                        <p className="text-xs text-gray-500">
                          {log.userName} • {new Date(log.createdAt).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata'
                          })}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => loadMockData()}
                      disabled={!pagination.hasPrevPage || loading}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => loadMockData()}
                      disabled={!pagination.hasNextPage || loading}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-900 border-gray-800 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">Audit Log Details</CardTitle>
                <Button
                  onClick={() => setSelectedLog(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Action:</span> <span className="text-white">{selectedLog.action}</span></div>
                    <div><span className="text-gray-500">User:</span> <span className="text-white">{selectedLog.userName}</span></div>
                    <div><span className="text-gray-500">Role:</span> <span className="text-white">{selectedLog.userRole}</span></div>
                    <div><span className="text-gray-500">Timestamp:</span> <span className="text-white">{new Date(selectedLog.createdAt).toLocaleString('en-IN')}</span></div>
                    <div><span className="text-gray-500">IP Address:</span> <span className="text-white">{selectedLog.ipAddress}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Status & Classification</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">Severity:</span>
                      <Badge className={getSeverityColor(selectedLog.severity)}>
                        {selectedLog.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">Outcome:</span>
                      {getOutcomeIcon(selectedLog.outcome)}
                      <span className="text-white text-sm">{selectedLog.outcome}</span>
                    </div>
                    {selectedLog.patientAbhaId && (
                      <div><span className="text-gray-500 text-sm">Patient ABHA:</span> <span className="text-white text-sm">{selectedLog.patientAbhaId}</span></div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                <p className="text-white text-sm bg-gray-800/50 p-3 rounded">{selectedLog.description}</p>
              </div>

              {selectedLog.errorMessage && (
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Error Message</h4>
                  <p className="text-red-300 text-sm bg-red-900/20 p-3 rounded border border-red-800">{selectedLog.errorMessage}</p>
                </div>
              )}

              {(selectedLog.namasteCodes?.length || selectedLog.icdCodes?.length) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Medical Codes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLog.namasteCodes && selectedLog.namasteCodes.length > 0 && (
                      <div>
                        <p className="text-xs text-cyan-400 mb-1">NAMASTE Codes</p>
                        {selectedLog.namasteCodes.map((code, index) => (
                          <Badge key={index} variant="outline" className="border-cyan-700 text-cyan-400 mr-1 mb-1">
                            {code.code}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {selectedLog.icdCodes && selectedLog.icdCodes.length > 0 && (
                      <div>
                        <p className="text-xs text-green-400 mb-1">ICD-11 Codes</p>
                        {selectedLog.icdCodes.map((code, index) => (
                          <Badge key={index} variant="outline" className="border-green-700 text-green-400 mr-1 mb-1">
                            {code.code}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedLog.previousState || selectedLog.newState) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLog.previousState && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Previous State</h4>
                      <pre className="text-xs bg-gray-800/50 p-3 rounded overflow-x-auto text-gray-300">
                        {JSON.stringify(selectedLog.previousState, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newState && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">New State</h4>
                      <pre className="text-xs bg-gray-800/50 p-3 rounded overflow-x-auto text-gray-300">
                        {JSON.stringify(selectedLog.newState, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;