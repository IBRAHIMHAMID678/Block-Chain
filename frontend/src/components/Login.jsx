
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Shield, UserPlus } from 'lucide-react';
import { loginDoctor } from '../authService';

const LoginScreen = ({ onLogin, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await loginDoctor(username, password);
            onLogin(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                    <p className="text-gray-400">Secure Blockchain Access</p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <ArrowRight size={18} />}
                            {loading ? 'Verifying...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>New Medical Staff?</p>
                        <button
                            onClick={onSwitchToRegister}
                            className="btn btn-secondary btn-sm"
                            style={{ width: 'auto', margin: '0 auto' }}
                        >
                            <UserPlus size={16} />
                            Create ID & Wallet
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginScreen;
