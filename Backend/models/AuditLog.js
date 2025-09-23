const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['doctor', 'patient', 'curator', 'admin'],
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      'RECORD_APPROVED',
      'RECORD_REJECTED', 
      'RECORD_CREATED',
      'RECORD_UPDATED',
      'RECORD_DELETED',
      'LOGIN',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'ROLE_CHANGE',
      'DATA_EXPORT',
      'DATA_IMPORT',
      'SYSTEM_ACCESS',
      'TERMINOLOGY_LOOKUP',
      'MAPPING_VALIDATED',
      'CONSENT_GRANTED',
      'CONSENT_REVOKED',
      'FHIR_BUNDLE_UPLOADED',
      'WHO_API_CALLED',
      'SEARCH_PERFORMED'
    ]
  },
  
  // Target resource details
  resourceType: {
    type: String,
    enum: ['MedicalRecord', 'User', 'Mapping', 'Bundle', 'TerminologyCode', 'System']
  },
  resourceId: {
    type: String // Can be ObjectId or external ID
  },
  
  // Patient information (if applicable)
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  patientAbhaId: {
    type: String
  },
  
  // Action metadata
  description: {
    type: String,
    required: true
  },
  
  // Before and after states for data changes
  previousState: {
    type: mongoose.Schema.Types.Mixed
  },
  newState: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Technical details
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  },
  
  // FHIR compliance metadata
  fhirVersion: {
    type: String,
    default: 'R4'
  },
  
  // India EHR Standards 2016 compliance
  consentVersion: {
    type: String
  },
  dataClassification: {
    type: String,
    enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
    default: 'CONFIDENTIAL'
  },
  
  // WHO ICD-11 integration metadata
  whoApiVersion: {
    type: String
  },
  icdCodes: [{
    code: String,
    system: String,
    version: String
  }],
  
  // NAMASTE terminology metadata
  namasteCodes: [{
    code: String,
    system: String,
    confidence: Number
  }],
  
  // Audit trail metadata
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  
  outcome: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING'],
    default: 'SUCCESS'
  },
  
  errorMessage: {
    type: String
  },
  
  // Compliance flags
  gdprCompliant: {
    type: Boolean,
    default: true
  },
  
  hipaaCompliant: {
    type: Boolean,
    default: true
  },
  
  indiaEhrCompliant: {
    type: Boolean,
    default: true
  },
  
  // Retention policy
  retentionPeriod: {
    type: Number,
    default: 2555 // 7 years in days (India EHR Standards requirement)
  },
  
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + this.retentionPeriod * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'auditlogs'
});

// Indexes for performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ patientAbhaId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ outcome: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

// Static method to create audit log
auditLogSchema.statics.logAction = async function(options) {
  const {
    user,
    action,
    description,
    resourceType,
    resourceId,
    patientId,
    patientAbhaId,
    previousState,
    newState,
    ipAddress,
    userAgent,
    sessionId,
    severity = 'MEDIUM',
    outcome = 'SUCCESS',
    errorMessage,
    whoApiVersion,
    icdCodes = [],
    namasteCodes = [],
    consentVersion
  } = options;

  try {
    const auditLog = new this({
      userId: user.id || user._id,
      userRole: user.role,
      userName: user.name,
      userEmail: user.email,
      action,
      description,
      resourceType,
      resourceId,
      patientId,
      patientAbhaId,
      previousState,
      newState,
      ipAddress,
      userAgent,
      sessionId,
      severity,
      outcome,
      errorMessage,
      whoApiVersion,
      icdCodes,
      namasteCodes,
      consentVersion
    });

    await auditLog.save();
    console.log(`✅ Audit log created: ${action} by ${user.name}`);
    return auditLog;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
    // Don't throw error to avoid breaking main functionality
    return null;
  }
};

// Instance method to mask sensitive data for display
auditLogSchema.methods.getMaskedForDisplay = function() {
  const masked = this.toJSON();
  
  // Mask sensitive data
  if (masked.previousState && masked.previousState.password) {
    masked.previousState.password = '***MASKED***';
  }
  if (masked.newState && masked.newState.password) {
    masked.newState.password = '***MASKED***';
  }
  
  return masked;
};

module.exports = mongoose.model('AuditLog', auditLogSchema);