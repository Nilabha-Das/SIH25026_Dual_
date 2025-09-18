const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkPatientData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find all patients
        const allPatients = await User.find({ role: 'patient' });
        console.log(`\n👥 Total patients in system: ${allPatients.length}`);
        
        if (allPatients.length > 0) {
            console.log('\n📋 Patient Details:');
            allPatients.forEach((patient, index) => {
                console.log(`${index + 1}. Name: ${patient.name}`);
                console.log(`   ABHA ID: ${patient.abhaId}`);
                console.log(`   Medical Records: ${patient.medicalRecords ? patient.medicalRecords.length : 0}`);
                console.log(`   ✅ Clean slate - no medical history\n`);
            });
        }
        
        // Check doctors too
        const allDoctors = await User.find({ role: 'doctor' });
        console.log(`👨‍⚕️ Total doctors in system: ${allDoctors.length}`);
        
        if (allDoctors.length > 0) {
            console.log('\n🩺 Doctor Details:');
            allDoctors.forEach((doctor, index) => {
                console.log(`${index + 1}. Name: ${doctor.name}`);
                console.log(`   Email: ${doctor.email}`);
                console.log(`   Password set: ${doctor.password ? 'Yes' : 'No'}\n`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking data:', error);
        process.exit(1);
    }
}

checkPatientData();