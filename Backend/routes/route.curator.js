const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auditLogger = require('../middleware/auditLogger');

// Get all pending records that need curator approval
router.get('/pending-records', async (req, res) => {
    try {
        const patients = await User.find({
            'medicalRecords.approvalStatus': 'pending'
        }).populate('medicalRecords.doctorId', 'name email');

        console.log('Found patients with pending records:', patients.length);

        const pendingRecords = patients.flatMap(patient => {
            return patient.medicalRecords
                .filter(record => record.approvalStatus === 'pending')
                .map(record => ({
                    patientId: patient._id,
                    patientName: patient.name,
                    patientAbhaId: patient.abhaId,
                    ...record.toObject()
                }));
        });

        console.log('Pending records to return:', pendingRecords.length);
        console.log('Sample record:', pendingRecords[0]);

        res.json(pendingRecords);
    } catch (error) {
        console.error('Error fetching pending records:', error);
        res.status(500).json({ message: 'Error fetching pending records' });
    }
});

// Handle curator approval/rejection
router.post('/:patientId/records/:recordId/review', async (req, res) => {
    try {
        const { decision, notes } = req.body;
        const { patientId, recordId } = req.params;
        const curatorId = null; // TODO: Add authentication middleware later

        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const record = patient.medicalRecords.id(recordId);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        record.approvalStatus = decision;
        record.curatorId = curatorId;
        record.curatorNotes = notes;
        if (decision === 'approved') {
            record.approvedAt = new Date();
        }

        await patient.save();

        // Log the approval/rejection action
        await auditLogger.logRecordApproval(req, {
            recordId: recordId,
            patientId: patientId,
            decision: decision,
            curatorId: curatorId,
            notes: notes,
            namasteCode: record.namasteCode,
            icd11Code: record.icd11Code
        });

        res.json({ message: `Record ${decision}`, record });
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ message: 'Error updating record' });
    }
});

module.exports = router;