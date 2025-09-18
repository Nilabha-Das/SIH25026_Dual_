require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function resetDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop the existing collection
        await mongoose.connection.collection('users').drop();
        console.log('Dropped users collection');

        // Create a test curator
        const curatorPassword = await bcrypt.hash('curator123', 10);
        const curator = await User.create({
            name: 'Test Curator',
            email: 'curator@test.com',
            password: curatorPassword,
            role: 'curator'
        });
        console.log('Created test curator:', curator);

        // Create a test doctor
        const doctorPassword = await bcrypt.hash('doctor123', 10);
        const doctor = await User.create({
            name: 'Test Doctor',
            email: 'doctor@test.com',
            password: doctorPassword,
            role: 'doctor'
        });
        console.log('Created test doctor:', doctor);

        // Create a test patient
        const patientPassword = await bcrypt.hash('patient123', 10);
        const patient = await User.create({
            name: 'Test Patient',
            email: 'patient@test.com',
            password: patientPassword,
            role: 'patient',
            abhaId: 'ABHA-1234-5678',
            medicalRecords: []
        });
        console.log('Created test patient:', patient);

        console.log('\nTest accounts created successfully!');
        console.log('\nCurator Login:');
        console.log('Email: curator@test.com');
        console.log('Password: curator123');
        console.log('\nDoctor Login:');
        console.log('Email: doctor@test.com');
        console.log('Password: doctor123');
        console.log('\nPatient Login:');
        console.log('Email: patient@test.com');
        console.log('Password: patient123');
        console.log('ABHA ID: ABHA-1234-5678');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

resetDB();