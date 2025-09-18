require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ConnectMongo = require('./db');

async function addTestData() {
    try {
        await ConnectMongo();
        
        // Create a test doctor
        const doctor = new User({
            name: 'Dr. Rajesh Kumar',
            email: 'dr.rajesh@example.com',
            password: 'password123',
            role: 'doctor',
            abhaId: 'DOC123456789'
        });
        await doctor.save();
        console.log('Doctor created:', doctor._id);
        
        // Create a test patient with medical records
        const patient = new User({
            name: 'Priya Sharma',
            email: 'priya.sharma@example.com',
            password: 'password123',
            role: 'patient',
            abhaId: 'PAT987654321',
            medicalRecords: [{
                doctorId: doctor._id,
                namasteCode: 'TM2_001',
                namasteTerm: 'वात रोग (Vata Dosha Imbalance)',
                icdCode: 'M79.3',
                icdTerm: 'Panniculitis, unspecified',
                prescription: `Tab. Ashwagandha 500mg - 1-0-1 after meals for 30 days
Tab. Brahmi 250mg - 1-0-1 after meals for 30 days
Syrup Saraswatarishta 10ml with equal water twice daily after meals

Dietary advice:
- Avoid cold and dry foods
- Include warm, cooked meals
- Regular oil massage with sesame oil`,
                approvalStatus: 'pending',
                submittedAt: new Date()
            }]
        });
        await patient.save();
        console.log('Patient with medical record created:', patient._id);
        
        // Create another test patient
        const patient2 = new User({
            name: 'Amit Patel',
            email: 'amit.patel@example.com',
            password: 'password123',
            role: 'patient',
            abhaId: 'PAT123789456',
            medicalRecords: [{
                doctorId: doctor._id,
                namasteCode: 'TM2_002',
                namasteTerm: 'पित्त विकार (Pitta Dosha Imbalance)',
                icdCode: 'K30',
                icdTerm: 'Functional dyspepsia',
                prescription: `Tab. Avipattikar Churna 3gm with water twice daily before meals
Cap. Shatavari 500mg - 1-0-1 after meals for 21 days
Syrup Kumaryasava 15ml with equal water twice daily after meals

Lifestyle recommendations:
- Avoid spicy and oily foods
- Take regular meals at fixed times
- Practice cooling pranayama`,
                approvalStatus: 'pending',
                submittedAt: new Date()
            }]
        });
        await patient2.save();
        console.log('Second patient with medical record created:', patient2._id);
        
        console.log('Test data added successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('Error adding test data:', error);
        process.exit(1);
    }
}

addTestData();