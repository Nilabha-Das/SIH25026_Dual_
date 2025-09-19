const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function clearAllMedicalHistory() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find all patients with medical records
        const patientsWithRecords = await User.find({ 
            role: 'patient',
            medicalRecords: { $exists: true, $not: { $size: 0 } }
        });
        
        console.log(`\n🔍 Found ${patientsWithRecords.length} patients with medical records:`);
        
        patientsWithRecords.forEach((patient, index) => {
            console.log(`${index + 1}. ${patient.name} (${patient.abhaId}) - ${patient.medicalRecords.length} records`);
        });
        
        if (patientsWithRecords.length === 0) {
            console.log('✅ No medical records found to clear.');
            process.exit(0);
            return;
        }
        
        // Clear all medical records
        console.log('\n🧹 Clearing all medical records...');
        const result = await User.updateMany(
            { role: 'patient' },
            { $set: { medicalRecords: [] } }
        );
        
        console.log(`✅ Cleared medical records from ${result.modifiedCount} patients`);
        
        // Verify the clearing
        const remainingRecords = await User.find({ 
            role: 'patient',
            medicalRecords: { $exists: true, $not: { $size: 0 } }
        });
        
        console.log(`\n✅ Verification: ${remainingRecords.length} patients now have medical records`);
        console.log('🎯 All medical history has been cleared!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing medical history:', error);
        process.exit(1);
    }
}

clearAllMedicalHistory();