const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sih2025_dual', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createSampleAuditLogs() {
  try {
    console.log('🔄 Creating sample audit logs...');

    // Sample audit logs for testing
    const sampleLogs = [
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'doctor',
        userName: 'Dr. Raj Patel',
        userEmail: 'raj.patel@hospital.in',
        action: 'RECORD_CREATED',
        description: 'Created medical record for patient with NAMASTE code NAM001 (Fever)',
        resourceType: 'MedicalRecord',
        resourceId: 'record_001',
        patientAbhaId: 'ABHA123456789012',
        severity: 'MEDIUM',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
        sessionId: 'session_001'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'curator',
        userName: 'Dr. Ananya Sharma',
        userEmail: 'ananya.sharma@hospital.in',
        action: 'RECORD_APPROVED',
        description: 'Approved medical record with NAMASTE-ICD11 mapping: NAM001 → XM1234',
        resourceType: 'MedicalRecord',
        resourceId: 'record_001',
        patientAbhaId: 'ABHA123456789012',
        severity: 'HIGH',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
        sessionId: 'session_002'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'doctor',
        userName: 'Dr. Priya Singh',
        userEmail: 'priya.singh@hospital.in',
        action: 'RECORD_UPDATED',
        description: 'Updated prescription for patient ABHA987654321098',
        resourceType: 'MedicalRecord',
        resourceId: 'record_002',
        patientAbhaId: 'ABHA987654321098',
        severity: 'MEDIUM',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        sessionId: 'session_003'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'doctor',
        userName: 'Dr. Arjun Kumar',
        userEmail: 'arjun.kumar@hospital.in',
        action: 'LOGIN',
        description: 'User logged into the system',
        resourceType: 'System',
        resourceId: 'login_001',
        severity: 'LOW',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59',
        sessionId: 'session_004'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'curator',
        userName: 'Dr. Ananya Sharma',
        userEmail: 'ananya.sharma@hospital.in',
        action: 'RECORD_REJECTED',
        description: 'Rejected medical record due to insufficient documentation',
        resourceType: 'MedicalRecord',
        resourceId: 'record_003',
        patientAbhaId: 'ABHA555666777888',
        severity: 'HIGH',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
        sessionId: 'session_005'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'doctor',
        userName: 'Dr. Raj Patel',
        userEmail: 'raj.patel@hospital.in',
        action: 'TERMINOLOGY_LOOKUP',
        description: 'Performed NAMASTE terminology lookup for "diabetes"',
        resourceType: 'TerminologyCode',
        resourceId: 'NAM023',
        severity: 'LOW',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
        sessionId: 'session_006'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'doctor',
        userName: 'Dr. Meera Reddy',
        userEmail: 'meera.reddy@hospital.in',
        action: 'RECORD_CREATED',
        description: 'Created medical record with TM2 code TM2_045 for traditional Ayurvedic treatment',
        resourceType: 'MedicalRecord',
        resourceId: 'record_004',
        patientAbhaId: 'ABHA999888777666',
        severity: 'MEDIUM',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) Safari/604.1',
        sessionId: 'session_007'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userRole: 'doctor',
        userName: 'Dr. Vikram Gupta',
        userEmail: 'vikram.gupta@hospital.in',
        action: 'WHO_API_CALLED',
        description: 'Called WHO ICD-11 API for entity validation',
        resourceType: 'System',
        resourceId: 'who_api_001',
        severity: 'LOW',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.106',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/89.0',
        sessionId: 'session_008'
      }
    ];

    // Add some variation in timestamps
    const now = new Date();
    sampleLogs.forEach((log, index) => {
      const hoursAgo = Math.floor(Math.random() * 72); // Random time within last 3 days
      log.createdAt = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
      log.updatedAt = log.createdAt;
    });

    // Delete existing audit logs for testing
    await AuditLog.deleteMany({});
    console.log('🗑️ Cleared existing audit logs');

    // Insert sample data
    const inserted = await AuditLog.insertMany(sampleLogs);
    console.log(`✅ Created ${inserted.length} sample audit logs`);

    // Display summary
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          actionBreakdown: { $push: '$action' },
          userBreakdown: { $push: '$userName' }
        }
      }
    ]);

    console.log('📊 Audit Log Statistics:');
    console.log(`   Total Logs: ${stats[0]?.totalLogs || 0}`);
    
    const actionCounts = {};
    stats[0]?.actionBreakdown.forEach(action => {
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    console.log('   Actions:', actionCounts);

    const userCounts = {};
    stats[0]?.userBreakdown.forEach(user => {
      userCounts[user] = (userCounts[user] || 0) + 1;
    });
    console.log('   Users:', userCounts);

    console.log('\n🎉 Sample audit logs created successfully!');
    console.log('🌐 You can now test the audit trail at: http://localhost:8081');
    console.log('📋 API endpoint: http://localhost:3000/api/audit/logs');
    
  } catch (error) {
    console.error('❌ Error creating sample audit logs:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createSampleAuditLogs();