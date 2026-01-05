import { useState, useEffect } from 'react'
import {
    Activity, Search, Plus, Shield, User, FileText,
    Database, Lock, CheckCircle, Server, Pill, AlertCircle,
    LogOut, Home, UserPlus, ClipboardList, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

const API_URL = 'http://localhost:5000/api';

function App() {
    const [user, setUser] = useState(null)
    const [view, setView] = useState('dashboard')
    const [chainInfo, setChainInfo] = useState(null)
    const [isMining, setIsMining] = useState(false)

    useEffect(() => {
        fetchChainInfo();
        const interval = setInterval(fetchChainInfo, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchChainInfo = async () => {
        try {
            const res = await fetch(`${API_URL}/chain`);
            const data = await res.json();
            setChainInfo(data);
        } catch (err) { console.error(err); }
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <AnimatePresence mode="wait">
                {!user ? (
                    <LoginScreen key="login" onLogin={(name) => setUser({ name })} />
                ) : (
                    <DashboardLayout key="dashboard" user={user} view={view} setView={setView} setUser={setUser}>
                        {view === 'dashboard' && <DashboardOverview chain={chainInfo} />}
                        {view === 'register' && <RegisterPatient setIsMining={setIsMining} />}
                        {view === 'add' && <AddRecordForm setIsMining={setIsMining} />}
                        {view === 'history' && <RecordsHistory />}
                        {view === 'prescriptions' && <PrescriptionManager setIsMining={setIsMining} />}
                    </DashboardLayout>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isMining && <MiningOverlay />}
            </AnimatePresence>
        </div>
    )
}

const LoginScreen = ({ onLogin }) => {
    const [name, setName] = useState('')

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
        >
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-4 shadow-lg">
                        <Shield size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        MedVault
                    </h1>
                    <p className="text-gray-400">Blockchain Medical Records System</p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <form onSubmit={(e) => { e.preventDefault(); if (name) onLogin(name); }}>
                        <div className="form-group">
                            <label className="form-label">Staff Credentials</label>
                            <div style={{ position: 'relative' }}>
                                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Enter your name (e.g., Dr. Smith)"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                            <Lock size={18} />
                            Sign In
                        </button>
                    </form>
                </motion.div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Authorized Personnel Only • Secure Blockchain Network
                </p>
            </div>
        </motion.div>
    )
}

const DashboardLayout = ({ children, user, view, setView, setUser }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: '#1e293b', borderRight: '1px solid #475569', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px' }}>
                            <Database size={24} style={{ color: '#3b82f6' }} />
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: '700' }}>MedVault</span>
                    </div>

                    <nav className="sidebar-nav">
                        <div
                            className={`sidebar-item ${view === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setView('dashboard')}
                        >
                            <Home size={20} />
                            <span>Dashboard</span>
                        </div>
                        <div
                            className={`sidebar-item ${view === 'register' ? 'active' : ''}`}
                            onClick={() => setView('register')}
                        >
                            <UserPlus size={20} />
                            <span>Register Patient</span>
                        </div>
                        <div
                            className={`sidebar-item ${view === 'add' ? 'active' : ''}`}
                            onClick={() => setView('add')}
                        >
                            <Plus size={20} />
                            <span>Add Record</span>
                        </div>
                        <div
                            className={`sidebar-item ${view === 'history' ? 'active' : ''}`}
                            onClick={() => setView('history')}
                        >
                            <ClipboardList size={20} />
                            <span>View Records</span>
                        </div>
                        <div
                            className={`sidebar-item ${view === 'prescriptions' ? 'active' : ''}`}
                            onClick={() => setView('prescriptions')}
                        >
                            <Pill size={20} />
                            <span>Prescriptions</span>
                        </div>
                    </nav>
                </div>

                <div style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid #475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                Online
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setUser(null)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

const DashboardOverview = ({ chain }) => {
    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Dashboard</h1>
                <p style={{ color: '#94a3b8' }}>Real-time blockchain network status and metrics</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Server />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Block Height</div>
                        <div className="stat-value">{chain?.height || 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Database />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Chain ID</div>
                        <div className="stat-value">{chain?.chainId || 'N/A'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <CheckCircle />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Status</div>
                        <div className="stat-value" style={{ fontSize: '24px' }}>Active</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} style={{ color: '#3b82f6' }} />
                    Smart Contract Information
                </h3>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>Contract Address:</span>
                        <span style={{ color: '#3b82f6' }}>{chain?.address || 'Loading...'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Network:</span>
                        <span style={{ color: '#10b981' }}>Hardhat Local</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RegisterPatient = ({ setIsMining }) => {
    const [data, setData] = useState({ id: '', name: '', dob: '' })
    const [message, setMessage] = useState(null)
    const [isMining, setLocalMining] = useState(false)

    const handleMiningState = (state) => {
        setLocalMining(state);
        setIsMining(state);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleMiningState(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_URL}/patient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: data.id, name: data.name, dob: parseInt(data.dob) })
            });
            const result = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Patient registered successfully! Transaction: ${result.txHash.substring(0, 10)}...` });
                setData({ id: '', name: '', dob: '' });
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            handleMiningState(false);
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Register New Patient</h1>
                <p style={{ color: '#94a3b8' }}>Add a new patient to the blockchain registry</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Patient ID</label>
                        <input
                            className="input-field"
                            placeholder="e.g., P001"
                            value={data.id}
                            onChange={e => setData({ ...data, id: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            className="input-field"
                            placeholder="e.g., John Doe"
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date of Birth (YYYYMMDD)</label>
                        <input
                            className="input-field"
                            placeholder="e.g., 19900101"
                            value={data.dob}
                            onChange={e => setData({ ...data, dob: e.target.value })}
                            required
                        />
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Format: Year (4 digits) + Month (2 digits) + Day (2 digits)</p>
                    </div>

                    {message && (
                        <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg" disabled={isMining}>
                        {isMining ? <div className="spinner" /> : <UserPlus size={18} />}
                        {isMining ? 'Registering...' : 'Register Patient'}
                    </button>
                </form>
            </div>
        </div>
    )
}

const AddRecordForm = ({ setIsMining }) => {
    const [data, setData] = useState({ patientId: '', diagnosis: '', treatment: '', notes: '' })
    const [message, setMessage] = useState(null)
    const [isMining, setLocalMining] = useState(false)

    const handleMiningState = (state) => {
        setLocalMining(state);
        setIsMining(state);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleMiningState(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_URL}/record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Medical record added! Transaction: ${result.txHash.substring(0, 10)}...` });
                setData({ patientId: '', diagnosis: '', treatment: '', notes: '' });
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            handleMiningState(false);
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Add Medical Record</h1>
                <p style={{ color: '#94a3b8' }}>Create a new encrypted medical record on the blockchain</p>
            </div>

            <div className="card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        <div className="form-group">
                            <label className="form-label">Patient ID</label>
                            <input
                                className="input-field"
                                placeholder="e.g., P001"
                                value={data.patientId}
                                onChange={e => setData({ ...data, patientId: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Diagnosis</label>
                            <input
                                className="input-field"
                                placeholder="e.g., Hypertension"
                                value={data.diagnosis}
                                onChange={e => setData({ ...data, diagnosis: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Treatment Plan</label>
                        <input
                            className="input-field"
                            placeholder="e.g., Medication and lifestyle changes"
                            value={data.treatment}
                            onChange={e => setData({ ...data, treatment: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Clinical Notes (Optional)</label>
                        <textarea
                            className="input-field"
                            placeholder="Additional observations and notes..."
                            value={data.notes}
                            onChange={e => setData({ ...data, notes: e.target.value })}
                        />
                    </div>

                    {message && (
                        <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-success btn-lg" disabled={isMining}>
                        {isMining ? <div className="spinner" /> : <Plus size={18} />}
                        {isMining ? 'Mining Block...' : 'Add Record'}
                    </button>
                </form>
            </div>
        </div>
    )
}

const RecordsHistory = () => {
    const [search, setSearch] = useState('')
    const [records, setRecords] = useState([])
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)

    const handleSearch = async () => {
        if (!search) return;
        setLoading(true);
        setSearched(true);
        setErrorMessage(null);
        try {
            // Fetch Records
            const resRecords = await fetch(`${API_URL}/records/${search}`);
            const dataRecords = await resRecords.json();

            // Fetch Prescriptions
            const resPrescriptions = await fetch(`${API_URL}/prescriptions/${search}`);
            const dataPrescriptions = await resPrescriptions.json();

            if (dataRecords.error || dataPrescriptions.error) {
                console.error('API Error:', dataRecords.error || dataPrescriptions.error);
                setErrorMessage(dataRecords.error || dataPrescriptions.error);
                setRecords([]);
                setPrescriptions([]);
            } else {
                setRecords(Array.isArray(dataRecords) ? dataRecords : []);
                setPrescriptions(Array.isArray(dataPrescriptions) ? dataPrescriptions : []);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('Failed to connect to blockchain. Please check if the backend is running.');
            setRecords([]);
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Patient History</h1>
                <p style={{ color: '#94a3b8' }}>Search and view immutable medical records and prescriptions</p>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                            placeholder="Enter Patient ID (e.g., P001)"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button onClick={handleSearch} className="btn btn-primary" disabled={loading}>
                        {loading ? <div className="spinner" /> : <Search size={18} />}
                        Search
                    </button>
                </div>
            </div>

            {loading && (
                <div className="empty-state">
                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
                    <div className="empty-state-text">Searching blockchain...</div>
                </div>
            )}

            {errorMessage && (
                <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                    <AlertCircle size={20} />
                    <span>{errorMessage}</span>
                </div>
            )}

            {!loading && searched && records.length === 0 && prescriptions.length === 0 && !errorMessage && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <ClipboardList />
                    </div>
                    <div className="empty-state-text">No history found</div>
                    <div className="empty-state-subtext">Try searching for a different Patient ID</div>
                </div>
            )}

            {!loading && (records.length > 0 || prescriptions.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Medical Records Section */}
                    {records.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText className="text-blue-500" />
                                Medical Records
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                                {records.map((record, i) => (
                                    <motion.div
                                        key={`rec-${i}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="card"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <FileText size={20} style={{ color: '#3b82f6' }} />
                                                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Record #{record.id}</h3>
                                                </div>
                                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Patient: {record.patientId}</p>
                                            </div>
                                            <div className="badge badge-info">
                                                <Clock size={12} />
                                                {record.timestamp}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>DIAGNOSIS</div>
                                                <div style={{ fontSize: '16px' }}>{record.diagnosis}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>TREATMENT</div>
                                                <div style={{ fontSize: '16px' }}>{record.treatment}</div>
                                            </div>
                                        </div>

                                        {record.notes && (
                                            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '12px' }}>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>NOTES</div>
                                                <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{record.notes}</div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                                            <User size={14} />
                                            <span>Recorded by: {record.doctor}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Prescriptions Section */}
                    {prescriptions.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Pill className="text-purple-500" />
                                Prescriptions
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                                {prescriptions.map((script, i) => (
                                    <motion.div
                                        key={`script-${i}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="card"
                                        style={{ borderLeft: '4px solid #a855f7' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <Pill size={20} style={{ color: '#a855f7' }} />
                                                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Prescription #{script.id}</h3>
                                                </div>
                                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Patient: {script.patientId}</p>
                                            </div>
                                            <div className={`badge ${script.status === 'Issued' ? 'badge-success' : 'badge-warning'}`}>
                                                {script.status}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>MEDICATION</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{script.medication}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>DOSAGE</div>
                                                <div style={{ fontSize: '16px' }}>{script.dosage}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} />
                                                <span>Doctor: {script.doctor}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Clock size={14} />
                                                <span>{script.timestamp}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const PrescriptionManager = ({ setIsMining }) => {
    const [data, setData] = useState({ patientId: '', medication: '', dosage: '' })
    const [message, setMessage] = useState(null)
    const [isMining, setLocalMining] = useState(false)

    const handleMiningState = (state) => {
        setLocalMining(state);
        setIsMining(state);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleMiningState(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_URL}/prescription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Prescription issued! Transaction: ${result.txHash.substring(0, 10)}...` });
                setData({ patientId: '', medication: '', dosage: '' });
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            handleMiningState(false);
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Issue Prescription</h1>
                <p style={{ color: '#94a3b8' }}>Create a digital prescription on the blockchain</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Patient ID</label>
                        <input
                            className="input-field"
                            placeholder="e.g., P001"
                            value={data.patientId}
                            onChange={e => setData({ ...data, patientId: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Medication</label>
                        <input
                            className="input-field"
                            placeholder="e.g., Amoxicillin"
                            value={data.medication}
                            onChange={e => setData({ ...data, medication: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Dosage Instructions</label>
                        <input
                            className="input-field"
                            placeholder="e.g., 500mg twice daily for 7 days"
                            value={data.dosage}
                            onChange={e => setData({ ...data, dosage: e.target.value })}
                            required
                        />
                    </div>

                    {message && (
                        <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg" disabled={isMining}>
                        {isMining ? <div className="spinner" /> : <Pill size={18} />}
                        {isMining ? 'Issuing...' : 'Issue Prescription'}
                    </button>
                </form>
            </div>
        </div>
    )
}

const MiningOverlay = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)'
        }}
    >
        <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    border: '4px solid transparent',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    inset: '8px',
                    border: '4px solid transparent',
                    borderRightColor: '#06b6d4',
                    borderRadius: '50%',
                    animation: 'spin 1.5s linear infinite reverse'
                }} />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Database size={32} style={{ color: 'white', animation: 'pulse 2s ease-in-out infinite' }} />
                </div>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Mining Block...</h2>
            <p style={{ color: '#3b82f6', fontFamily: 'monospace' }}>Processing transaction on blockchain</p>
        </div>
    </motion.div>
)

export default App
