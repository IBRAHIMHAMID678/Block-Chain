const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HospitalRecord", function () {
    let HospitalRecord;
    let hospitalRecord;
    let owner, doctor, pharmacist, other;

    beforeEach(async function () {
        [owner, doctor, pharmacist, other] = await ethers.getSigners();
        HospitalRecord = await ethers.getContractFactory("HospitalRecord");
        hospitalRecord = await HospitalRecord.deploy();

        // Auth setup
        await hospitalRecord.addDoctor(doctor.address);
        await hospitalRecord.addPharmacist(pharmacist.address);
    });

    describe("Patient Management", function () {
        it("Should allow doctor to register patient", async function () {
            await hospitalRecord.connect(doctor).registerPatient("P001", "John Doe", 19900101);
            const patient = await hospitalRecord.getPatient("P001");
            expect(patient.name).to.equal("John Doe");
            expect(patient.exists).to.be.true;
        });

        it("Should prevent duplicate registration", async function () {
            await hospitalRecord.connect(doctor).registerPatient("P001", "John Doe", 19900101);
            await expect(
                hospitalRecord.connect(doctor).registerPatient("P001", "Jane", 19900101)
            ).to.be.revertedWith("Patient already exists");
        });
    });

    describe("Records", function () {
        beforeEach(async function () {
            await hospitalRecord.connect(doctor).registerPatient("P001", "John Doe", 19900101);
        });

        it("Should add and retrieve records", async function () {
            await hospitalRecord.connect(doctor).addRecord("P001", "Flu", "Rest", "Active");
            const records = await hospitalRecord.getRecords("P001");
            expect(records.length).to.equal(1);
            expect(records[0].diagnosis).to.equal("Flu");
        });
    });

    describe("Prescriptions", function () {
        beforeEach(async function () {
            await hospitalRecord.connect(doctor).registerPatient("P001", "John Doe", 19900101);
            await hospitalRecord.connect(doctor).issuePrescription("P001", "Advil", "500mg");
        });

        it("Should allow pharmacist to dispense", async function () {
            await hospitalRecord.connect(pharmacist).dispensePrescription("P001", 0);
            const scripts = await hospitalRecord.getPrescriptions("P001");
            // Enum: Issued=0, Dispensed=1
            expect(scripts[0].status).to.equal(1n);
        });
    });
});
