const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Hardhat Localhost Configuration
const PROVIDER_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Account #0 (Owner/Doctor)

// Load Contract Config
const configPath = path.join(__dirname, 'contractConfig.json');
let contract;

const initBlockchain = async () => {
    try {
        if (!fs.existsSync(configPath)) {
            console.log("Contract config not found. Please deploy contract.");
            return;
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        contract = new ethers.Contract(config.address, config.abi, wallet);

        console.log("Connected to Contract at:", config.address);

        // Auto-authorize the wallet as a Doctor/Pharmacist for logic to work
        // In a real app, we'd deploy with one account and authorize others.
        // Here we assume Owner (Wallet) has all permissions.

    } catch (error) {
        console.error("Blockchain init failed:", error);
    }
}
initBlockchain();

// Helper to format BigInts
const formatRecord = (r) => ({
    id: r.id.toString(),
    patientId: r.patientId,
    diagnosis: r.diagnosis,
    treatment: r.treatment,
    notes: r.notes,
    timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
    doctor: r.doctor
});

const formatPrescription = (p) => ({
    id: p.id.toString(),
    patientId: p.patientId,
    medication: p.medication,
    dosage: p.dosage,
    status: ["Issued", "Dispensed", "Cancelled"][Number(p.status)],
    timestamp: new Date(Number(p.timestamp) * 1000).toLocaleString(),
    doctor: p.doctor
});

// --- API Endpoints ---

// Register Patient
app.post('/api/patient', async (req, res) => {
    const { id, name, dob } = req.body;
    try {
        const tx = await contract.registerPatient(id, name, dob);
        await tx.wait(); // Mine
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.reason || error.message });
    }
});

// Get Patient
app.get('/api/patient/:id', async (req, res) => {
    try {
        const p = await contract.getPatient(req.params.id);
        if (!p.exists) return res.status(404).json({ error: "Patient not found" });
        res.json({ id: p.id, name: p.name, dob: p.dob.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Record
app.post('/api/record', async (req, res) => {
    const { patientId, diagnosis, treatment, notes } = req.body;
    try {
        const tx = await contract.addRecord(patientId, diagnosis, treatment, notes);
        const receipt = await tx.wait();
        res.json({ success: true, txHash: tx.hash, block: receipt.blockNumber });
    } catch (error) {
        res.status(500).json({ error: error.reason || error.message });
    }
});

// Get Records
app.get('/api/records/:patientId', async (req, res) => {
    console.log(`[API] Getting records for patient: ${req.params.patientId}`);
    try {
        const records = await contract.getRecords(req.params.patientId);
        console.log(`[API] Found ${records.length} records`);
        res.json(records.map(formatRecord));
    } catch (error) {
        console.error(`[API] Error getting records:`, error.code, error.message);
        // If error is BAD_DATA, it means no records exist (empty array decode issue)
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode')) {
            console.log(`[API] Returning empty array for patient ${req.params.patientId}`);
            res.json([]); // Return empty array
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Issue Prescription
app.post('/api/prescription', async (req, res) => {
    const { patientId, medication, dosage } = req.body;
    try {
        const tx = await contract.issuePrescription(patientId, medication, dosage);
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.reason || error.message });
    }
});

// Dispense Prescription (Pharmacist Action)
app.post('/api/dispense', async (req, res) => {
    const { patientId, prescriptionId } = req.body;
    try {
        // Ensure wallet is authorized as Pharmacist first (only needed once, but for statelessness...)
        // Actually, Owner has all perms in our contract? 
        // Our 'onlyPharmacist' requires msg.sender in 'pharmacists' mapping OR 'owner'.
        // Initial setup script should handle Roles.
        const tx = await contract.dispensePrescription(patientId, prescriptionId);
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.reason || error.message });
    }
});

// Get Prescriptions
app.get('/api/prescriptions/:patientId', async (req, res) => {
    try {
        const scripts = await contract.getPrescriptions(req.params.patientId);
        res.json(scripts.map(formatPrescription));
    } catch (error) {
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode')) {
            res.json([]);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Audit Log (Using Events)
app.get('/api/audit/:patientId', async (req, res) => {
    try {
        const filter = contract.filters.RecordAdded(req.params.patientId);
        const logs = await contract.queryFilter(filter);
        const audit = logs.map(l => ({
            event: "RecordAdded",
            block: l.blockNumber,
            tx: l.transactionHash
        }));
        res.json(audit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chain Stats
app.get('/api/chain', async (req, res) => {
    // Return dummy data or query provider for block height
    try {
        const blockNumber = await contract.runner.provider.getBlockNumber();
        const network = await contract.runner.provider.getNetwork();
        res.json({
            height: blockNumber,
            chainId: network.chainId.toString(),
            address: await contract.getAddress()
        });
    } catch (error) {
        res.json({ error: "Chain not connected" });
    }
});

app.listen(PORT, () => {
    console.log(`BaaS (Blockchain-as-a-Service) running on port ${PORT}`);
});
