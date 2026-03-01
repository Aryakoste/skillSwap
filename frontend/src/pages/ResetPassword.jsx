import React, { useState } from 'react';
import axios from 'axios';
import { Lock, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong or token is invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.15), transparent 60%)' }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: 'var(--accent-indigo)', filter: 'blur(50px)', opacity: 0.5 }}></div>
                <div style={{ position: 'absolute', bottom: -50, left: -50, width: 100, height: 100, background: 'var(--accent-cyan)', filter: 'blur(50px)', opacity: 0.5 }}></div>

                <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
                    <div className="logo-icon delay-1" style={{ margin: '0 auto 16px auto', width: 64, height: 64, fontSize: 32 }}>🔐</div>
                    <h1 className="logo-title delay-2 fade-in" style={{ fontSize: '28px' }}>Reset Password</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Create a new password for your account.</p>
                </div>

                {message && <div className="fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>{message}</div>}
                {error && <div className="fade-in" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                {!success && (
                    <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }} className="fade-in delay-3">
                        <div className="input-group" style={{ marginBottom: '20px' }}>
                            <label className="input-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingLeft: '44px' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '28px' }}>
                            <label className="input-label">Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ paddingLeft: '44px' }}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight size={18} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
