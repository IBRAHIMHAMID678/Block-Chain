// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HospitalRecord {
    // --- Roles ---
    address public owner;
    mapping(address => bool) public doctors;
    mapping(address => bool) public pharmacists;

    // --- Data Structures ---
    struct Patient {
        string id; // SSN or UUID
        string name;
        uint256 dob;
        bool exists;
    }

    struct Record {
        uint256 id;
        string patientId;
        string diagnosis;
        string treatment;
        string notes;
        uint256 timestamp;
        address doctor;
    }

    enum PrescriptionStatus { Issued, Dispensed, Cancelled }
    struct Prescription {
        uint256 id;
        string patientId;
        string medication;
        string dosage;
        PrescriptionStatus status;
        uint256 timestamp;
        address doctor;
    }

    struct LabResult {
        uint256 id;
        string patientId;
        string testType; // Blood, X-Ray, etc.
        string resultData; // Could be IPFS hash or text
        bool isCritical;
        uint256 timestamp;
        address technician;
    }

    // --- Storage ---
    mapping(string => Patient) public patients; // patientId -> Patient
    mapping(string => Record[]) public patientRecords; // patientId -> Records
    mapping(string => Prescription[]) public patientPrescriptions; // patientId -> Prescriptions
    mapping(string => LabResult[]) public patientLabResults; // patientId -> LabResults
    
    // Access Audit
    event DataAccessed(string indexed patientId, address indexed accessor, string reason, uint256 timestamp);

    // Events
    event PatientRegistered(string patientId, string name);
    event RecordAdded(string indexed patientId, uint256 recordId, address indexed doctor);
    event PrescriptionIssued(string indexed patientId, uint256 prescriptionId);
    event PrescriptionDispensed(uint256 prescriptionId);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender] || msg.sender == owner, "Only doctor");
        _;
    }

    modifier onlyPharmacist() {
        require(pharmacists[msg.sender] || msg.sender == owner, "Only pharmacist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- User Management ---
    function addDoctor(address _doctor) external onlyOwner {
        doctors[_doctor] = true;
    }

    function addPharmacist(address _pharmacist) external onlyOwner {
        pharmacists[_pharmacist] = true;
    }

    // --- Patient Management ---
    function registerPatient(string memory _id, string memory _name, uint256 _dob) external onlyDoctor {
        require(!patients[_id].exists, "Patient already exists");
        patients[_id] = Patient(_id, _name, _dob, true);
        emit PatientRegistered(_id, _name);
    }

    function getPatient(string memory _id) external view returns (Patient memory) {
        return patients[_id];
    }

    // --- Medical Records ---
    function addRecord(string memory _patientId, string memory _diagnosis, string memory _treatment, string memory _notes) external onlyDoctor {
        require(patients[_patientId].exists, "Patient not found");
        
        uint256 newId = patientRecords[_patientId].length;
        patientRecords[_patientId].push(Record(
            newId,
            _patientId,
            _diagnosis,
            _treatment,
            _notes,
            block.timestamp,
            msg.sender
        ));

        emit RecordAdded(_patientId, newId, msg.sender);
    }

    function getRecords(string memory _patientId) external view returns (Record[] memory) {
        return patientRecords[_patientId];
    }

    // --- Prescriptions ---
    function issuePrescription(string memory _patientId, string memory _medication, string memory _dosage) external onlyDoctor {
        require(patients[_patientId].exists, "Patient not found");
        
        uint256 newId = patientPrescriptions[_patientId].length;
        patientPrescriptions[_patientId].push(Prescription(
            newId,
            _patientId,
            _medication,
            _dosage,
            PrescriptionStatus.Issued,
            block.timestamp,
            msg.sender
        ));

        emit PrescriptionIssued(_patientId, newId);
    }

    function dispensePrescription(string memory _patientId, uint256 _id) external onlyPharmacist {
        require(_id < patientPrescriptions[_patientId].length, "Invalid ID");
        Prescription storage p = patientPrescriptions[_patientId][_id];
        require(p.status == PrescriptionStatus.Issued, "Not active");
        
        p.status = PrescriptionStatus.Dispensed;
        emit PrescriptionDispensed(_id);
    }

    function getPrescriptions(string memory _patientId) external view returns (Prescription[] memory) {
        return patientPrescriptions[_patientId];
    }

    // --- Lab Results ---
    function addLabResult(string memory _patientId, string memory _testType, string memory _resultData, bool _isCritical) external onlyDoctor {
        require(patients[_patientId].exists, "Patient not found");
        
        uint256 newId = patientLabResults[_patientId].length;
        patientLabResults[_patientId].push(LabResult(
            newId,
            _patientId,
            _testType,
            _resultData,
            _isCritical,
            block.timestamp,
            msg.sender
        ));
    }

    function getLabResults(string memory _patientId) external view returns (LabResult[] memory) {
        return patientLabResults[_patientId];
    }

    // --- Audit ---
    function logAccess(string memory _patientId, string memory _reason) external {
        // Can be called by anyone authorized to view
        emit DataAccessed(_patientId, msg.sender, _reason, block.timestamp);
    }
}
