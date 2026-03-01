import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                    <div className="logo-icon delay-1" style={{ margin: '0 auto 16px auto', width: 64, height: 64, fontSize: 32 }}>🔑</div>
                    <h1 className="logo-title delay-2 fade-in" style={{ fontSize: '28px' }}>Forgot Password</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {message && <div className="fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>{message}</div>}
                {error && <div className="fade-in" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }} className="fade-in delay-3">
                    <div className="input-group" style={{ marginBottom: '28px' }}>
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input"
                                placeholder="name@neighborhood.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '44px' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={loading}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="fade-in delay-3" style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', position: 'relative', zIndex: 1 }}>
                    <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
