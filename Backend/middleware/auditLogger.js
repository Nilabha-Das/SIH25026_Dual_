const AuditLog = require('../models/AuditLog');

/**
 * Audit logging middleware for FHIR-compliant medical record systems
 * Complies with India EHR Standards 2016, HIPAA, and GDPR requirements
 */

// Helper function to extract client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip ||
         'unknown';
};

// Helper function to extract session ID
const getSessionId = (req) => {
  return req.sessionID || 
         req.headers['session-id'] || 
         req.headers['x-session-id'] ||
         'no-session';
};

// Helper function to determine severity based on action
const getActionSeverity = (action) => {
  const criticalActions = ['RECORD_DELETED', 'ROLE_CHANGE', 'CONSENT_REVOKED', 'DATA_EXPORT'];
  const highActions = ['RECORD_APPROVED', 'RECORD_REJECTED', 'PASSWORD_CHANGE', 'DATA_IMPORT'];
  const mediumActions = ['RECORD_CREATED', 'RECORD_UPDATED', 'LOGIN', 'FHIR_BUNDLE_UPLOADED'];
  
  if (criticalActions.includes(action)) return 'CRITICAL';
  if (highActions.includes(action)) return 'HIGH';
  if (mediumActions.includes(action)) return 'MEDIUM';
  return 'LOW';
};

// Main audit logging function
const auditLogger = {
  
  /**
   * Log any action with comprehensive metadata
   */
  async logAction(options) {
    const {
      req,
      user,
      action,
      description,
      resourceType,
      resourceId,
      patientId,
      patientAbhaId,
      previousState,
      newState,
      outcome = 'SUCCESS',
      errorMessage,
      whoApiVersion,
      icdCodes = [],
      namasteCodes = [],
      consentVersion
    } = options;

    try {
      await AuditLog.logAction({
        user,
        action,
        description,
        resourceType,
        resourceId,
        patientId,
        patientAbhaId,
        previousState,
        newState,
        ipAddress: req ? getClientIP(req) : 'system',
        userAgent: req ? req.headers['user-agent'] : 'system',
        sessionId: req ? getSessionId(req) : 'system',
        severity: getActionSeverity(action),
        outcome,
        errorMessage,
        whoApiVersion,
        icdCodes,
        namasteCodes,
        consentVersion
      });
    } catch (error) {
      console.error('❌ Audit logging failed:', error);
      // Don't throw to avoid breaking main functionality
    }
  },

  /**
   * Middleware for automatic request logging
   */
  middleware() {
    return async (req, res, next) => {
      // Store original res.json to intercept responses
      const originalJson = res.json;
      
      res.json = function(data) {
        // Log the response if user is authenticated
        if (req.user && req.route) {
          const action = determineActionFromRoute(req);
          if (action) {
            auditLogger.logAction({
              req,
              user: req.user,
              action,
              description: `${req.method} ${req.route.path}`,
              resourceType: determineResourceType(req),
              outcome: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
              errorMessage: res.statusCode >= 400 ? data.message : undefined
            });
          }
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    };
  },

  /**
   * Specific methods for common actions
   */
  
  async logLogin(req, user, outcome = 'SUCCESS', errorMessage = null) {
    await this.logAction({
      req,
      user,
      action: 'LOGIN',
      description: `User login attempt: ${user.email}`,
      resourceType: 'User',
      resourceId: user.id || user._id,
      outcome,
      errorMessage,
      severity: outcome === 'FAILURE' ? 'HIGH' : 'MEDIUM'
    });
  },

  async logLogout(req, user) {
    await this.logAction({
      req,
      user,
      action: 'LOGOUT',
      description: `User logged out: ${user.email}`,
      resourceType: 'User',
      resourceId: user.id || user._id,
      severity: 'LOW'
    });
  },

  async logRecordApproval(req, user, recordId, patientAbhaId, decision, notes) {
    await this.logAction({
      req,
      user,
      action: decision === 'approved' ? 'RECORD_APPROVED' : 'RECORD_REJECTED',
      description: `Medical record ${decision} by curator. Notes: ${notes || 'No notes'}`,
      resourceType: 'MedicalRecord',
      resourceId: recordId,
      patientAbhaId,
      newState: { decision, notes, approvedBy: user.id, approvedAt: new Date() },
      severity: 'HIGH'
    });
  },

  async logRecordCreation(req, user, recordData, patientAbhaId) {
    await this.logAction({
      req,
      user,
      action: 'RECORD_CREATED',
      description: `New medical record created for patient ${patientAbhaId}`,
      resourceType: 'MedicalRecord',
      resourceId: recordData.id,
      patientAbhaId,
      newState: recordData,
      namasteCodes: recordData.namasteCode ? [{ 
        code: recordData.namasteCode, 
        system: 'NAMASTE',
        confidence: recordData.confidence 
      }] : [],
      icdCodes: recordData.icdCode ? [{ 
        code: recordData.icdCode, 
        system: 'ICD-11',
        version: 'WHO-2023' 
      }] : [],
      severity: 'MEDIUM'
    });
  },

  async logTerminologyLookup(req, user, searchTerm, results, system) {
    await this.logAction({
      req,
      user,
      action: 'TERMINOLOGY_LOOKUP',
      description: `Terminology search: "${searchTerm}" in ${system} returned ${results.length} results`,
      resourceType: 'TerminologyCode',
      severity: 'LOW'
    });
  },

  async logWhoApiCall(req, user, endpoint, response, whoApiVersion) {
    await this.logAction({
      req,
      user,
      action: 'WHO_API_CALLED',
      description: `WHO ICD-11 API call: ${endpoint}`,
      resourceType: 'System',
      whoApiVersion,
      icdCodes: response && response.results ? response.results.map(r => ({
        code: r.code,
        system: 'ICD-11',
        version: whoApiVersion
      })) : [],
      severity: 'LOW'
    });
  },

  async logFhirBundleUpload(req, user, bundleData, patientAbhaId) {
    await this.logAction({
      req,
      user,
      action: 'FHIR_BUNDLE_UPLOADED',
      description: `FHIR Bundle uploaded with ${bundleData.entry?.length || 0} entries`,
      resourceType: 'Bundle',
      resourceId: bundleData.id,
      patientAbhaId,
      newState: { entryCount: bundleData.entry?.length, bundleType: bundleData.type },
      severity: 'MEDIUM'
    });
  },

  async logConsentChange(req, user, patientAbhaId, consentType, granted, consentVersion) {
    await this.logAction({
      req,
      user,
      action: granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      description: `Patient consent ${granted ? 'granted' : 'revoked'} for ${consentType}`,
      resourceType: 'User',
      patientAbhaId,
      newState: { consentType, granted, version: consentVersion },
      consentVersion,
      severity: 'HIGH'
    });
  },

  async logDataExport(req, user, exportType, recordCount, patientIds = []) {
    await this.logAction({
      req,
      user,
      action: 'DATA_EXPORT',
      description: `Data export: ${exportType}, ${recordCount} records`,
      resourceType: 'System',
      newState: { exportType, recordCount, patientCount: patientIds.length },
      severity: 'CRITICAL'
    });
  }
};

// Helper functions for middleware
function determineActionFromRoute(req) {
  const method = req.method;
  const path = req.route.path;
  
  if (path.includes('/login')) return 'LOGIN';
  if (path.includes('/logout')) return 'LOGOUT';
  if (path.includes('/approve') || path.includes('/reject')) return 'RECORD_APPROVED';
  if (method === 'POST' && path.includes('/records')) return 'RECORD_CREATED';
  if (method === 'PUT' && path.includes('/records')) return 'RECORD_UPDATED';
  if (method === 'DELETE') return 'RECORD_DELETED';
  if (path.includes('/search')) return 'SEARCH_PERFORMED';
  if (path.includes('/bundle')) return 'FHIR_BUNDLE_UPLOADED';
  if (path.includes('/who')) return 'WHO_API_CALLED';
  
  return 'SYSTEM_ACCESS';
}

function determineResourceType(req) {
  const path = req.route.path;
  
  if (path.includes('/records')) return 'MedicalRecord';
  if (path.includes('/users')) return 'User';
  if (path.includes('/bundle')) return 'Bundle';
  if (path.includes('/terminology') || path.includes('/namaste')) return 'TerminologyCode';
  if (path.includes('/mapping')) return 'Mapping';
  
  return 'System';
}

module.exports = auditLogger;