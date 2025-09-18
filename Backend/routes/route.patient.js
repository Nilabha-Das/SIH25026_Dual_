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

module.exports = router;
