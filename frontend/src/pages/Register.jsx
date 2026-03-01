import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Wrench, Home, Briefcase, Monitor, Check } from 'lucide-react';

const SkillSelector = ({ availableSkills, selectedSkills, onToggle, color }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {availableSkills.map(skill => {
            const isSelected = selectedSkills.includes(skill);
            return (
                <div
                    key={skill}
                    onClick={() => onToggle(skill)}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isSelected ? '600' : 'normal',
                        background: isSelected ? 'rgba(255,255,255,0.05)' : 'var(--panel-bg)',
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        border: `1px solid ${isSelected ? color : 'var(--panel-border)'}`,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isSelected ? `0 0 10px ${color}33` : 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected) {
                            e.currentTarget.style.borderColor = color;
                            e.currentTarget.style.color = 'var(--text-main)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--panel-border)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }
                    }}
                >
                    {isSelected && <Check size={14} color={color} />}
                    {skill}
                </div>
            );
        })}
        {availableSkills.length === 0 && <span className="text-muted text-sm" style={{ padding: '10px 0' }}>No skills currently available in this category.</span>}
    </div>
);

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mainSkill: '',
        lat: 19.0760, // Default to Mumbai roughly
        lng: 72.8777
    });

    // Tab state
    const [activeTab, setActiveTab] = useState('household');

    // Arrays for multi-select
    const [householdSkills, setHouseholdSkills] = useState([]);
    const [professionalSkills, setProfessionalSkills] = useState([]);
    const [softwareSkills, setSoftwareSkills] = useState([]);

    // Predefined skills from DB
    const [predefinedSkills, setPredefinedSkills] = useState({
        household: [],
        professional: [],
        software: []
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const sRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/skills`);
                if (sRes.data.success) {
                    setPredefinedSkills(sRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };
        fetchSkills();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSkill = (category, skill) => {
        let currentSkills, setFunc;

        switch (category) {
            case 'household':
                currentSkills = householdSkills;
                setFunc = setHouseholdSkills;
                break;
            case 'professional':
                currentSkills = professionalSkills;
                setFunc = setProfessionalSkills;
                break;
            case 'software':
                currentSkills = softwareSkills;
                setFunc = setSoftwareSkills;
                break;
            default: return;
        }

        if (currentSkills.includes(skill)) {
            setFunc(currentSkills.filter(s => s !== skill));
        } else {
            setFunc([...currentSkills, skill]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const completeData = {
                ...formData,
                skillsets: {
                    household: householdSkills,
                    professional: professionalSkills,
                    software: softwareSkills
                }
            };
            await register(completeData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 0', background: 'radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.15), transparent 60%)' }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '520px', padding: '40px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, left: -50, width: 120, height: 120, background: 'var(--accent-cyan)', filter: 'blur(60px)', opacity: 0.4 }}></div>
                <div style={{ position: 'absolute', bottom: -50, right: -50, width: 120, height: 120, background: 'var(--accent-emerald)', filter: 'blur(60px)', opacity: 0.4 }}></div>

                <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
                    <div className="logo-icon delay-1" style={{ margin: '0 auto 12px auto', width: 56, height: 56, fontSize: 28, background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))' }}>✨</div>
                    <h1 className="logo-title delay-2 fade-in" style={{ fontSize: '26px' }}>Join SkillSwap</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Connect with neighbors & share your talents.</p>
                </div>

                {error && <div className="fade-in" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }} className="fade-in delay-3">
                    <div className="input-group" style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontSize: '14px' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                name="name" className="input" placeholder="e.g. Jane Doe"
                                onChange={handleChange} style={{ paddingLeft: '44px', width: '100%', background: 'rgba(0,0,0,0.2)' }} required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontSize: '14px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email" name="email" className="input" placeholder="name@neighborhood.com"
                                onChange={handleChange} style={{ paddingLeft: '44px', width: '100%', background: 'rgba(0,0,0,0.2)' }} required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontSize: '14px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password" name="password" className="input" placeholder="Create a strong password"
                                onChange={handleChange} style={{ paddingLeft: '44px', width: '100%', background: 'rgba(0,0,0,0.2)' }} required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
                        <label className="input-label" style={{ fontSize: '14px' }}>Your Superpower (Main Skill)</label>
                        <div style={{ position: 'relative' }}>
                            <Wrench size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                name="mainSkill" className="input" placeholder="e.g. Yoga Instructor, Plumber"
                                onChange={handleChange} style={{ paddingLeft: '44px', width: '100%', background: 'rgba(0,0,0,0.2)' }} required
                            />
                        </div>
                    </div>

                    <div className="line" style={{ height: '1px', background: 'var(--panel-border)', margin: '24px 0' }}></div>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px', textAlign: 'left' }}>Select Your Competencies</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'left', marginBottom: '16px' }}>Highlight the skills you bring to the community</p>

                    <div style={{ background: 'var(--bg-dark)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', marginBottom: '32px' }}>
                        {/* Tabs Header */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
                            <div
                                onClick={() => setActiveTab('household')}
                                style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'household' ? '2px solid var(--accent-cyan)' : '2px solid transparent', color: activeTab === 'household' ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: activeTab === 'household' ? '600' : 'normal', transition: 'all 0.2s' }}
                            >
                                <Home size={16} /> Household
                            </div>
                            <div
                                onClick={() => setActiveTab('professional')}
                                style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'professional' ? '2px solid var(--accent-indigo)' : '2px solid transparent', color: activeTab === 'professional' ? 'var(--accent-indigo)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: activeTab === 'professional' ? '600' : 'normal', transition: 'all 0.2s' }}
                            >
                                <Briefcase size={16} /> Professional
                            </div>
                            <div
                                onClick={() => setActiveTab('software')}
                                style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'software' ? '2px solid var(--accent-purple)' : '2px solid transparent', color: activeTab === 'software' ? 'var(--accent-purple)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: activeTab === 'software' ? '600' : 'normal', transition: 'all 0.2s' }}
                            >
                                <Monitor size={16} /> Software
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div style={{ padding: '24px', textAlign: 'left' }}>
                            {activeTab === 'household' && (
                                <SkillSelector
                                    availableSkills={predefinedSkills.household}
                                    selectedSkills={householdSkills}
                                    onToggle={(skill) => toggleSkill('household', skill)}
                                    color="var(--accent-cyan)"
                                />
                            )}
                            {activeTab === 'professional' && (
                                <SkillSelector
                                    availableSkills={predefinedSkills.professional}
                                    selectedSkills={professionalSkills}
                                    onToggle={(skill) => toggleSkill('professional', skill)}
                                    color="var(--accent-indigo)"
                                />
                            )}
                            {activeTab === 'software' && (
                                <SkillSelector
                                    availableSkills={predefinedSkills.software}
                                    selectedSkills={softwareSkills}
                                    onToggle={(skill) => toggleSkill('software', skill)}
                                    color="var(--accent-purple)"
                                />
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))' }} disabled={loading}>
                        {loading ? 'Creating Profile...' : 'Create Account'}
                    </button>
                </form>

                <div className="fade-in delay-3" style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-emerald)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
