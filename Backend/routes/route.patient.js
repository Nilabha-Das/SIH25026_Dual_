const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get patient by ABHA ID
router.get('/:abhaId', async (req, res) => {
    try {
        const patient = await User.findOne({ 
            abhaId: req.params.abhaId,
            role: 'patient'
        }).select('-password');  // Exclude password from response

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ message: 'Error fetching patient details' });
    }
});

// Add medical record for a patient (needs curator approval)
router.post('/:abhaId/records', async (req, res) => {
    try {
        const {
            doctorId,
            namasteCode,
            namasteTerm,
            icdCode,
            icdTerm,
            prescription
        } = req.body;

        // Validate required fields
        if (!doctorId) return res.status(400).json({ message: 'Doctor ID is required' });
        if (!namasteCode) return res.status(400).json({ message: 'NAMASTE code is required' });
        if (!namasteTerm) return res.status(400).json({ message: 'NAMASTE term is required' });
        if (!icdCode) return res.status(400).json({ message: 'ICD code is required' });
        if (!icdTerm) return res.status(400).json({ message: 'ICD term is required' });
        if (!prescription) return res.status(400).json({ message: 'Prescription is required' });

        const patient = await User.findOne({ abhaId: req.params.abhaId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Validate doctor exists
            // Validate doctor exists and is actually a doctor
            const doctor = await User.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found with ID: ' + doctorId });
            }
            if (doctor.role !== 'doctor') {
                return res.status(400).json({ message: 'User with ID ' + doctorId + ' is not a doctor' });
            }        const newRecord = {
            doctorId,
            namasteCode,
            namasteTerm,
            icdCode,
            icdTerm,
            prescription,
            date: new Date(),
            approvalStatus: 'pending',
            submittedAt: new Date()
        };

        patient.medicalRecords.push(newRecord);
        await patient.save();

        res.status(201).json(newRecord);
    } catch (error) {
        console.error('Error adding medical record:', {
            error,
            requestBody: req.body,
            patientId: req.params.abhaId
        });
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                details: error.message 
            });
        }
        res.status(500).json({ 
            message: 'Error adding medical record',
            details: error.message
        });
    }
});

// Get all medical records for a patient
router.get('/:abhaId/records', async (req, res) => {
    try {
        const patient = await User.findOne({ abhaId: req.params.abhaId })
            .select('medicalRecords')
            .populate('medicalRecords.doctorId', 'name');

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient.medicalRecords);
    } catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ message: 'Error fetching medical records' });
    }
});

// Get only approved medical records for a patient (for patient dashboard)
router.get('/:abhaId/approved-records', async (req, res) => {
    try {
        const patient = await User.findOne({ abhaId: req.params.abhaId })
            .select('medicalRecords name')
            .populate('medicalRecords.doctorId', 'name email')
            .populate('medicalRecords.curatorId', 'name');

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Filter only approved records
        const approvedRecords = patient.medicalRecords
            .filter(record => record.approvalStatus === 'approved')
            .map(record => ({
                id: record._id,
                patientName: patient.name,
                patientAbhaId: patient.abhaId,
                doctorName: record.doctorId?.name || 'Unknown Doctor',
                doctorEmail: record.doctorId?.email,
                curatorName: record.curatorId?.name,
                namasteCode: record.namasteCode,
                namasteTerm: record.namasteTerm,
                tm2Code: record.tm2Code,
                tm2Title: record.tm2Title,
                icdCode: record.icdCode,
                icdTerm: record.icdTerm,
                prescription: record.prescription,
                date: record.date,
                submittedAt: record.submittedAt,
                approvedAt: record.approvedAt,
                curatorNotes: record.curatorNotes,
                status: record.approvalStatus
            }));

        console.log(`Found ${approvedRecords.length} approved records for patient ${req.params.abhaId}`);
        res.json(approvedRecords);
    } catch (error) {
        console.error('Error fetching approved medical records:', error);
        res.status(500).json({ message: 'Error fetching approved medical records' });
    }
});

// Update a specific medical record
router.put('/:abhaId/records/:recordId', async (req, res) => {
    try {
        const { abhaId, recordId } = req.params;
        const {
            namasteTerm,
            namasteCode,
            tm2Title,
            tm2Code,
            icdTerm,
            icdCode,
            prescription
        } = req.body;

        console.log('Updating medical record:', { abhaId, recordId, body: req.body });

        const patient = await User.findOne({ abhaId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Find the medical record by ID
        const record = patient.medicalRecords.id(recordId);
        
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        // Update the record fields
        if (namasteTerm !== undefined) record.namasteTerm = namasteTerm;
        if (namasteCode !== undefined) record.namasteCode = namasteCode;
        if (tm2Title !== undefined) record.tm2Title = tm2Title;
        if (tm2Code !== undefined) record.tm2Code = tm2Code;
        if (icdTerm !== undefined) record.icdTerm = icdTerm;
        if (icdCode !== undefined) record.icdCode = icdCode;
        if (prescription !== undefined) record.prescription = prescription;
        
        // Update modification timestamp
        record.modifiedAt = new Date();

        await patient.save();

        console.log('Medical record updated successfully');
        res.json({ message: 'Medical record updated successfully', record });
    } catch (error) {
        console.error('Error updating medical record:', error);
        res.status(500).json({ 
            message: 'Error updating medical record',
            details: error.message
        });
    }
});

// Delete a specific medical record
router.delete('/:abhaId/records/:recordId', async (req, res) => {
    try {
        const { abhaId, recordId } = req.params;

        console.log('Deleting medical record:', { abhaId, recordId });

        const patient = await User.findOne({ abhaId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Find and remove the medical record by ID
        const record = patient.medicalRecords.id(recordId);
        
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        // Remove the record using Mongoose subdocument methods
        record.deleteOne();
        await patient.save();

        console.log('Medical record deleted successfully');
        res.json({ message: 'Medical record deleted successfully' });
    } catch (error) {
        console.error('Error deleting medical record:', error);
        res.status(500).json({ 
            message: 'Error deleting medical record',
            details: error.message
        });
    }
});

module.exports = router;
