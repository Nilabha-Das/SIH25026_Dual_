const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

// Middleware to check if user is curator or admin
const requireCuratorOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'curator' && req.user.role !== 'admin')) {
    return res.status(403).json({ 
      message: 'Access denied. Curator or admin privileges required.' 
    });
  }
  next();
};

// @route   GET /api/audit/logs
// @desc    Get audit logs with filtering and pagination
// @access  Public for testing (TODO: Re-enable auth later)
router.get('/logs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userId,
      patientAbhaId,
      severity,
      outcome,
      resourceType,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (patientAbhaId) filter.patientAbhaId = patientAbhaId;
    if (severity) filter.severity = severity;
    if (outcome) filter.outcome = outcome;
    if (resourceType) filter.resourceType = resourceType;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Text search across description and user details
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with population
    const [logs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .populate('patientId', 'name abhaId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    // Mask sensitive data for display
    const maskedLogs = logs.map(log => {
      const masked = { ...log };
      if (masked.previousState && masked.previousState.password) {
        masked.previousState.password = '***MASKED***';
      }
      if (masked.newState && masked.newState.password) {
        masked.newState.password = '***MASKED***';
      }
      return masked;
    });

    // Log this audit access
    await auditLogger.logAction({
      req,
      user: req.user,
      action: 'DATA_EXPORT',
      description: `Audit logs accessed. Retrieved ${logs.length} logs with filters: ${JSON.stringify(filter)}`,
      resourceType: 'System',
      severity: 'MEDIUM'
    });

    res.json({
      logs: maskedLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + logs.length < totalCount,
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        action,
        userId,
        patientAbhaId,
        severity,
        outcome,
        resourceType,
        startDate,
        endDate,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    
    // Log the error
    await auditLogger.logAction({
      req,
      user: req.user,
      action: 'DATA_EXPORT',
      description: 'Failed to retrieve audit logs',
      resourceType: 'System',
      outcome: 'FAILURE',
      errorMessage: error.message,
      severity: 'HIGH'
    });

    res.status(500).json({ 
      message: 'Error retrieving audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/audit/logs/:id
// @desc    Get specific audit log by ID
// @access  Curator/Admin only
router.get('/logs/:id', auth, requireCuratorOrAdmin, async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('patientId', 'name abhaId')
      .lean();

    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    // Mask sensitive data
    const maskedLog = log.getMaskedForDisplay ? log.getMaskedForDisplay() : log;
    if (maskedLog.previousState && maskedLog.previousState.password) {
      maskedLog.previousState.password = '***MASKED***';
    }
    if (maskedLog.newState && maskedLog.newState.password) {
      maskedLog.newState.password = '***MASKED***';
    }

    // Log this access
    await auditLogger.logAction({
      req,
      user: req.user,
      action: 'SYSTEM_ACCESS',
      description: `Audit log ${req.params.id} accessed`,
      resourceType: 'System',
      resourceId: req.params.id,
      severity: 'LOW'
    });

    res.json(maskedLog);

  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ 
      message: 'Error retrieving audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/audit/stats
// @desc    Get audit statistics and summary
// @access  Curator/Admin only  
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Aggregate statistics
    const stats = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          actionBreakdown: {
            $push: '$action'
          },
          severityBreakdown: {
            $push: '$severity'
          },
          outcomeBreakdown: {
            $push: '$outcome'
          },
          uniqueUsers: { $addToSet: '$userId' },
          uniquePatients: { $addToSet: '$patientAbhaId' }
        }
      }
    ]);

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentActivity = await AuditLog.find({
      createdAt: { $gte: yesterday }
    })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Action frequency
    const actionStats = {};
    const severityStats = {};
    const outcomeStats = {};

    if (stats.length > 0) {
      stats[0].actionBreakdown.forEach(action => {
        actionStats[action] = (actionStats[action] || 0) + 1;
      });

      stats[0].severityBreakdown.forEach(severity => {
        severityStats[severity] = (severityStats[severity] || 0) + 1;
      });

      stats[0].outcomeBreakdown.forEach(outcome => {
        outcomeStats[outcome] = (outcomeStats[outcome] || 0) + 1;
      });
    }

    const response = {
      period: `Last ${days} days`,
      summary: stats.length > 0 ? {
        totalLogs: stats[0].totalLogs,
        uniqueUsersCount: stats[0].uniqueUsers.length,
        uniquePatientsCount: stats[0].uniquePatients.filter(p => p).length,
        averageLogsPerDay: Math.round(stats[0].totalLogs / parseInt(days))
      } : {
        totalLogs: 0,
        uniqueUsersCount: 0,
        uniquePatientsCount: 0,
        averageLogsPerDay: 0
      },
      breakdowns: {
        actions: actionStats,
        severity: severityStats,
        outcomes: outcomeStats
      },
      recentActivity: recentActivity.map(log => ({
        id: log._id,
        action: log.action,
        description: log.description,
        userName: log.userName,
        severity: log.severity,
        outcome: log.outcome,
        createdAt: log.createdAt,
        formattedTime: log.createdAt.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata'
        })
      }))
    };

    // Log this stats access
    await auditLogger.logAction({
      req,
      user: req.user,
      action: 'DATA_EXPORT',
      description: `Audit statistics accessed for ${days} days`,
      resourceType: 'System',
      severity: 'LOW'
    });

    res.json(response);

  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ 
      message: 'Error retrieving audit statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/audit/patient/:abhaId
// @desc    Get audit logs for specific patient
// @access  Curator/Admin only
router.get('/patient/:abhaId', auth, requireCuratorOrAdmin, async (req, res) => {
  try {
    const { abhaId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, totalCount] = await Promise.all([
      AuditLog.find({ patientAbhaId: abhaId })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments({ patientAbhaId: abhaId })
    ]);

    // Mask sensitive data
    const maskedLogs = logs.map(log => {
      const masked = { ...log };
      if (masked.previousState && masked.previousState.password) {
        masked.previousState.password = '***MASKED***';
      }
      if (masked.newState && masked.newState.password) {
        masked.newState.password = '***MASKED***';
      }
      return masked;
    });

    // Log this access
    await auditLogger.logAction({
      req,
      user: req.user,
      action: 'DATA_EXPORT',
      description: `Patient audit history accessed for ABHA ID: ${abhaId}`,
      resourceType: 'System',
      patientAbhaId: abhaId,
      severity: 'MEDIUM'
    });

    res.json({
      patientAbhaId: abhaId,
      logs: maskedLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching patient audit logs:', error);
    res.status(500).json({ 
      message: 'Error retrieving patient audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/audit/export
// @desc    Export audit logs (CSV/JSON)
// @access  Curator/Admin only
router.post('/export', async (req, res) => {
  try {
    const { 
      format = 'json',
      filters = {},
      fields = []
    } = req.body;

    // Build filter query
    const filter = {};
    if (filters.action) filter.action = filters.action;
    if (filters.severity) filter.severity = filters.severity;
    if (filters.startDate || filters.endDate) {
      filter.createdAt = {};
      if (filters.startDate) filter.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.createdAt.$lte = new Date(filters.endDate);
    }

    // Get logs
    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .populate('patientId', 'name abhaId')
      .sort({ createdAt: -1 })
      .limit(1000) // Limit for performance
      .lean();

    // Log this export
    await auditLogger.logDataExport(
      req,
      req.user,
      `audit_logs_${format}`,
      logs.length,
      [...new Set(logs.map(l => l.patientId).filter(Boolean))]
    );

    if (format === 'csv') {
      // Convert to CSV (simplified)
      const csvHeaders = 'Timestamp,Action,User,Description,Severity,Outcome\n';
      const csvRows = logs.map(log => 
        `"${log.createdAt}","${log.action}","${log.userName}","${log.description}","${log.severity}","${log.outcome}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.csv`);
      res.send(csvHeaders + csvRows);
    } else {
      // Return JSON
      const maskedLogs = logs.map(log => {
        const masked = { ...log };
        if (masked.previousState && masked.previousState.password) {
          masked.previousState.password = '***MASKED***';
        }
        if (masked.newState && masked.newState.password) {
          masked.newState.password = '***MASKED***';
        }
        return masked;
      });

      res.json({
        exportedAt: new Date().toISOString(),
        totalRecords: maskedLogs.length,
        filters,
        data: maskedLogs
      });
    }

  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ 
      message: 'Error exporting audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;