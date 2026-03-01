import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
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
                    <div className="logo-icon delay-1" style={{ margin: '0 auto 16px auto', width: 64, height: 64, fontSize: 32 }}>🤝</div>
                    <h1 className="logo-title delay-2 fade-in" style={{ fontSize: '28px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Enter your details to access your neighborhood.</p>
                </div>

                {error && <div className="fade-in" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }} className="fade-in delay-3">
                    <div className="input-group">
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

                    <div className="input-group" style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-label">Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--accent-cyan)', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="fade-in delay-3" style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
                    New to the neighborhood? <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>Create account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
