const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
});

const RecordSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    notes: { type: String },
    doctor: { type: String, default: "Dr. Ibrahim" },
    timestamp: { type: Date, default: Date.now },
    txHash: { type: String } // Link to blockchain transaction
});

const PrescriptionSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    medication: { type: String, required: true },
    dosage: { type: String, required: true },
    status: { type: String, enum: ['Issued', 'Dispensed', 'Cancelled'], default: 'Issued' },
    doctor: { type: String, default: "Dr. Ibrahim" },
    timestamp: { type: Date, default: Date.now },
    txHash: { type: String }
});

const Patient = mongoose.model('Patient', PatientSchema);
const Record = mongoose.model('Record', RecordSchema);
const Prescription = mongoose.model('Prescription', PrescriptionSchema);

module.exports = { Patient, Record, Prescription };
