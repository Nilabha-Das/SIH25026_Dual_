require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ConnectMongo = require('./db');

async function approveTestRecord() {
    try {
        await ConnectMongo();
        
        // Find the patient with ABHA ID PAT987654321
        const patient = await User.findOne({ abhaId: 'PAT987654321' });
        
        if (!patient) {
            console.log('Patient not found');
            return;
        }
        
        console.log('Found patient:', patient.name);
        console.log('Medical records:', patient.medicalRecords.length);
        
        // Find the first pending record and approve it
        const pendingRecord = patient.medicalRecords.find(record => record.approvalStatus === 'pending');
        
        if (!pendingRecord) {
            console.log('No pending records found');
            return;
        }
        
        console.log('Approving record:', pendingRecord.namasteTerm);
        
        // Approve the record
        pendingRecord.approvalStatus = 'approved';
        pendingRecord.approvedAt = new Date();
        pendingRecord.curatorNotes = 'Record approved during testing - diagnosis and prescription are appropriate.';
        
        await patient.save();
        
        console.log('Record approved successfully!');
        console.log('Patient now has approved records available for dashboard display');
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error approving record:', error);
        process.exit(1);
    }
}

approveTestRecord();