const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Constants
const PROVIDER_URL = "http://127.0.0.1:8545";
const ADMIN_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Account #0 (Owner)

// In-Memory Storage
const usersDB = {};

// Helper to get Admin Contract
const getAdminContract = () => {
    try {
        const configPath = path.join(__dirname, 'contractConfig.json');
        if (!fs.existsSync(configPath)) return null;

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

        return new ethers.Contract(config.address, config.abi, wallet);
    } catch (e) {
        console.error("Failed to load contract config:", e);
        return null;
    }
}

// 1. Register Doctor (Create Wallet + Whitelist on Chain)
router.post('/register', async (req, res) => {
    const { username, password, name } = req.body;

    if (usersDB[username]) {
        return res.status(400).json({ error: "User already exists" });
    }

    try {
        // A. Create New Blockchain Wallet
        const wallet = ethers.Wallet.createRandom();

        // B. Whitelist on Smart Contract (Admin Action)
        const contract = getAdminContract();
        if (contract) {
            console.log(`[Auth] Whitelisting ${wallet.address} on-chain...`);
            const tx = await contract.addDoctor(wallet.address);
            await tx.wait();

            // --- NEW: Fund the Wallet with ETH (Gas) ---
            const provider = contract.runner.provider;
            const adminWallet = contract.runner;

            console.log(`[Auth] Funding wallet with 10 ETH...`);

            // Fix: Explicitly fetch latest nonce to prevent "Nonce too low" errors
            const txCount = await provider.getTransactionCount(adminWallet.address, "latest");

            const txFund = await adminWallet.sendTransaction({
                to: wallet.address,
                value: ethers.parseEther("10.0"),
                nonce: txCount
            });
            await txFund.wait();
            console.log(`       -> Funded! Tx: ${txFund.hash}`);
            // -------------------------------------------
        } else {
            console.error("Could not connect to contract for whitelisting");
        }

        // C. Save User
        usersDB[username] = {
            name,
            password,
            privateKey: wallet.privateKey,
            address: wallet.address
        };

        console.log(`[Auth] Registered Dr. ${name} (${username})`);

        res.json({ success: true, address: wallet.address });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Login (Get Wallet Info)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = usersDB[username];

    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
        success: true,
        username,
        name: user.name,
        address: user.address,
    });
});

// Helper to get signer for a user
const getSigner = (username, provider) => {
    const user = usersDB[username];
    if (!user) return null;
    return new ethers.Wallet(user.privateKey, provider);
}

module.exports = { router, getSigner, usersDB };
