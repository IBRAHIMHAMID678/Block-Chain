
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Shield, ArrowLeft, BadgeCheck } from 'lucide-react';
import { registerDoctor } from '../authService';

const RegisterScreen = ({ onRegistered, onBack }) => {
    const [formData, setFormData] = useState({ name: '', username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await registerDoctor(formData.username, formData.password, formData.name);
            if (res.error) throw new Error(res.error);
            onRegistered(formData.username, formData.password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex items-center justify-center p-4"
        >
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 mb-4 shadow-lg">
                        <BadgeCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">
                        Staff Registration
                    </h1>
                    <p className="text-gray-400">Create your Secure Blockchain Identity</p>
                </motion.div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                className="input-field"
                                placeholder="e.g., Dr. Strange"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    required
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
                                    placeholder="Choose a password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <ArrowRight size={18} />}
                            {loading ? 'Creating Wallet...' : 'Register & Create Wallet'}
                        </button>
                    </form>

                    <button
                        onClick={onBack}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', marginTop: '16px', color: '#94a3b8' }}
                    >
                        <ArrowLeft size={16} style={{ marginRight: 8 }} />
                        Back to Login
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default RegisterScreen;
