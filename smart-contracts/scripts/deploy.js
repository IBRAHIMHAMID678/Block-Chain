const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const HospitalRecord = await hre.ethers.getContractFactory("HospitalRecord");
    const hospitalRecord = await HospitalRecord.deploy();
    await hospitalRecord.waitForDeployment();

    const address = await hospitalRecord.getAddress();
    console.log("HospitalRecord deployed to:", address);

    // Save config for Backend
    const configPath = path.join(__dirname, "../../backend/contractConfig.json");

    // In Hardhat CJS, artifacts helper is available on hre
    const artifact = await hre.artifacts.readArtifact("HospitalRecord");

    const config = {
        address: address,
        abi: artifact.abi
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Config saved to:", configPath);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
