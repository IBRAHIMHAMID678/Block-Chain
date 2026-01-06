const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const { router: authRouter, getSigner, usersDB } = require('./authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Mount Auth Routes
app.use('/api/auth', authRouter);

const PORT = 5000;

// Hardhat Localhost Configuration
const PROVIDER_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Admin/Deployer Key

// Load Contract Config
const configPath = path.join(__dirname, 'contractConfig.json');
let contractAddress;
let contractAbi;
let provider;

const initBlockchain = async () => {
    try {
        if (!fs.existsSync(configPath)) {
            console.log("Contract config not found.");
            return;
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        contractAddress = config.address;
        contractAbi = config.abi;

        provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        console.log("Connected to Blockchain Node");

    } catch (error) {
        console.error("Blockchain init failed:", error);
    }
}
initBlockchain();

// Helper to get a READ-ONLY contract (for public queries)
const getReadContract = () => {
    return new ethers.Contract(contractAddress, contractAbi, provider);
}

// Helper to get a WRITE contract signed by a specific USER
const getWriteContract = (username) => {
    const signer = getSigner(username, provider);
    if (!signer) throw new Error("User wallet not found");
    return new ethers.Contract(contractAddress, contractAbi, signer);
}

// Helper to get ADMIN contract (for registering doctors etc)
const getAdminContract = () => {
    const adminWallet = new ethers.Wallet(PRIVATE_KEY, provider);
    return new ethers.Contract(contractAddress, contractAbi, adminWallet);
}


// --- API Endpoints ---

// 1. Register Patient (Admin/System Action)
app.post('/api/patient', async (req, res) => {
    const { id, name, dob } = req.body;
    try {
        // Only Admin needs to pay for patient registration in this model
        // Or any doctor could do it. Let's use Admin for now to ensure it works.
        const contract = getAdminContract();

        const dobTimestamp = Math.floor(new Date(dob).getTime() / 1000) || 0;
        const tx = await contract.registerPatient(id, name, dobTimestamp);
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

// 2. Add Record (SIGNED BY DOCTOR)
app.post('/api/record', async (req, res) => {
    // Request must now include 'username' (who is logged in)
    const { patientId, diagnosis, treatment, notes, username } = req.body;

    console.log(`[Add Record] By Doctor: ${username} -> Patient: ${patientId}`);

    try {
        // A. Get the Contract Signed by THIS Doctor
        const contract = getWriteContract(username);

        // B. Send Transaction (Signed by Doctor's Private Key)
        const tx = await contract.addRecord(patientId, diagnosis, treatment, notes);
        const receipt = await tx.wait();

        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("Add Record Failed:", error.message);
        console.error(error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

// 3. Issue Prescription (SIGNED BY DOCTOR)
app.post('/api/prescription', async (req, res) => {
    const { patientId, medication, dosage, username } = req.body;
    try {
        const contract = getWriteContract(username);
        const tx = await contract.issuePrescription(patientId, medication, dosage);
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.reason || error.message });
    }
});

// --- Read Only Endpoints ---

app.get('/api/patient/:id', async (req, res) => {
    try {
        const contract = getReadContract();
        const p = await contract.getPatient(req.params.id);
        if (!p.exists) return res.status(404).json({ error: "Patient not found" });
        res.json({ id: p.id, name: p.name, dob: p.dob.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper to get doctor name from address
const getDoctorName = (addr) => {
    // Find user by address in our DB
    const user = Object.values(usersDB).find(u => u.address.toLowerCase() === addr.toLowerCase());
    return user ? `Dr. ${user.name}` : addr; // Fallback to address if not found
}

// Helper to format BigInts
const formatRecord = (r) => ({
    id: r.id.toString(),
    patientId: r.patientId,
    diagnosis: r.diagnosis,
    treatment: r.treatment,
    notes: r.notes,
    timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
    doctor: getDoctorName(r.doctor)
});

app.get('/api/records/:patientId', async (req, res) => {
    try {
        const contract = getReadContract();
        const records = await contract.getRecords(req.params.patientId);
        res.json(records.map(formatRecord));
    } catch (error) {
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode')) {
            res.json([]);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.get('/api/prescriptions/:patientId', async (req, res) => {
    try {
        const contract = getReadContract();
        const scripts = await contract.getPrescriptions(req.params.patientId);
        res.json(scripts.map(script => ({
            id: script.id.toString(),
            medication: script.medication,
            dosage: script.dosage,
            status: ["Issued", "Dispensed", "Cancelled"][Number(script.status)],
            doctor: getDoctorName(script.doctor)
        })));
    } catch (error) {
        res.json([]);
    }
});

app.get('/api/chain', async (req, res) => {
    try {
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        res.json({
            height: blockNumber,
            chainId: network.chainId.toString(),
            address: contractAddress,
            backendMode: "MANAGED WALLET AUTH"
        });
    } catch (error) {
        res.json({ error: "Chain not connected" });
    }
});

// Auto-Register 2 Dummy Doctors for Demo
// "Seed" the DB with our hardcoded demo users
usersDB['admin'] = { name: "System Admin", password: "123", privateKey: PRIVATE_KEY, address: "0xf39... (Admin)" };

app.listen(PORT, () => {
    console.log(`✅ Managed Auth Blockchain Backend running on port ${PORT}`);
});
