const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

// Load environment variables
require('dotenv').config();

const sampleAuditData = [
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'curator',
    userName: 'Dr. Ananya Sharma',
    userEmail: 'ananya@hospital.in',
    action: 'RECORD_APPROVED',
    description: 'Medical record approved for NAMASTE code NAM001 mapped to ICD-11 XM1234 (Fever)',
    resourceType: 'MedicalRecord',
    resourceId: new mongoose.Types.ObjectId().toString(),
    patientAbhaId: 'ABHA001234567890',
    severity: 'MEDIUM',
    outcome: 'SUCCESS',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    sessionId: 'session_' + Date.now(),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      namasteCode: 'NAM001',
      icd11Code: 'XM1234',
      icd11Title: 'Fever'
    }
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'curator',
    userName: 'Dr. Ananya Sharma',
    userEmail: 'ananya@hospital.in',
    action: 'RECORD_REJECTED',
    description: 'Medical record rejected - insufficient documentation for NAMASTE code NAM002',
    resourceType: 'MedicalRecord',
    resourceId: new mongoose.Types.ObjectId().toString(),
    patientAbhaId: 'ABHA001234567891',
    severity: 'HIGH',
    outcome: 'SUCCESS',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    sessionId: 'session_' + (Date.now() - 3600000),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      namasteCode: 'NAM002',
      rejectionReason: 'Incomplete patient symptoms description'
    },
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'doctor',
    userName: 'Dr. Raj Patel',
    userEmail: 'raj@hospital.in',
    action: 'FHIR_BUNDLE_UPLOADED',
    description: 'FHIR R4 bundle uploaded with 5 resources for patient care coordination',
    resourceType: 'Bundle',
    resourceId: new mongoose.Types.ObjectId().toString(),
    patientAbhaId: 'ABHA001234567892',
    severity: 'LOW',
    outcome: 'SUCCESS',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    sessionId: 'session_' + (Date.now() - 7200000),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      bundleId: 'bundle_' + Date.now(),
      resourceCount: 5,
      fhirVersion: 'R4'
    },
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'admin',
    userName: 'System Admin',
    userEmail: 'admin@hospital.in',
    action: 'WHO_API_CALLED',
    description: 'WHO ICD-11 API called for entity validation - Pneumonia classification lookup',
    resourceType: 'TerminologyCode',
    resourceId: 'who_entity_' + Date.now(),
    severity: 'LOW',
    outcome: 'SUCCESS',
    ipAddress: '192.168.1.200',
    userAgent: 'System/1.0 (NAMASTE-Backend)',
    sessionId: 'system_session_' + Date.now(),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      whoEntityId: '410525008',
      apiEndpoint: '/icd/entity/410525008',
      responseTime: '245ms'
    },
    timestamp: new Date(Date.now() - 10800000)
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'curator',
    userName: 'Dr. Priya Singh',
    userEmail: 'priya@hospital.in',
    action: 'LOGIN',
    description: 'Curator logged into the NAMASTE system',
    resourceType: 'User',
    severity: 'LOW',
    outcome: 'SUCCESS',
    ipAddress: '192.168.1.150',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    sessionId: 'session_' + (Date.now() - 14400000),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      loginMethod: 'credentials',
      browserInfo: 'Chrome 91.0.4472.124'
    },
    timestamp: new Date(Date.now() - 14400000)
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'doctor',
    userName: 'Dr. Arjun Kumar',
    userEmail: 'arjun@hospital.in',
    action: 'MAPPING_VALIDATED',
    description: 'New NAMASTE to ICD-11 mapping created for Ayurvedic diagnosis',
    resourceType: 'Mapping',
    resourceId: new mongoose.Types.ObjectId().toString(),
    severity: 'MEDIUM',
    outcome: 'SUCCESS',
    ipAddress: '192.168.1.180',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    sessionId: 'session_' + (Date.now() - 18000000),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      namasteCode: 'NAM025',
      icd11Code: 'XM9876',
      mappingConfidence: 0.95,
      validatorId: 'curator_123'
    },
    timestamp: new Date(Date.now() - 18000000)
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'curator',
    userName: 'Dr. Ananya Sharma',
    userEmail: 'ananya@hospital.in',
    action: 'DATA_EXPORT',
    description: 'Audit logs exported to CSV for compliance reporting',
    resourceType: 'System',
    severity: 'MEDIUM',
    outcome: 'SUCCESS',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    sessionId: 'session_' + (Date.now() - 21600000),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      exportFormat: 'CSV',
      recordCount: 150,
      dateRange: '2025-09-01 to 2025-09-23'
    },
    timestamp: new Date(Date.now() - 21600000)
  },
  {
    userId: new mongoose.Types.ObjectId(),
    userRole: 'admin',
    userName: 'Database System',
    userEmail: 'system@hospital.in',
    action: 'SYSTEM_ACCESS',
    description: 'Automated database backup completed successfully',
    resourceType: 'System',
    severity: 'LOW',
    outcome: 'SUCCESS',
    ipAddress: '127.0.0.1',
    userAgent: 'MongoDB/6.0 Backup Service',
    sessionId: 'backup_session_' + Date.now(),
    complianceFlags: {
      hipaaCompliant: true,
      gdprCompliant: true,
      indiaEhrCompliant: true
    },
    metadata: {
      backupSize: '2.3GB',
      backupLocation: '/backups/namaste_backup_' + new Date().toISOString().split('T')[0] + '.gz',
      compressionRatio: '0.75'
    },
    timestamp: new Date(Date.now() - 25200000)
  }
];

async function populateAuditData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/namaste_db');
    console.log('✅ Connected to MongoDB');

    // Clear existing audit data
    const deleteResult = await AuditLog.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing audit logs`);

    // Insert sample audit data
    const insertResult = await AuditLog.insertMany(sampleAuditData);
    console.log(`📊 Inserted ${insertResult.length} sample audit logs`);

    // Display summary
    const totalLogs = await AuditLog.countDocuments();
    console.log(`📈 Total audit logs in database: ${totalLogs}`);

    // Show action breakdown
    const actionStats = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📋 Action breakdown:');
    actionStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    // Show severity breakdown
    const severityStats = await AuditLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n⚠️  Severity breakdown:');
    severityStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    console.log('\n🎉 Audit database populated successfully!');
    console.log('🌐 You can now test the audit trail at: http://localhost:8081');
    
  } catch (error) {
    console.error('❌ Error populating audit data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the population script
if (require.main === module) {
  console.log('🚀 Populating audit database with sample data...\n');
  populateAuditData();
}

module.exports = { populateAuditData, sampleAuditData };