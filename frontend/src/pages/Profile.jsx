import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Save, Briefcase, Home, Monitor, Check } from 'lucide-react';
import axios from 'axios';

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
                        background: isSelected ? 'rgba(255,255,255,0.1)' : 'var(--panel-bg)',
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

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState('household');

    // Form states
    const [bio, setBio] = useState('');
    const [mainSkill, setMainSkill] = useState('');
    const [servicesText, setServicesText] = useState('');

    // Arrays instead of strings for multi-select
    const [householdSkills, setHouseholdSkills] = useState([]);
    const [professionalSkills, setProfessionalSkills] = useState([]);
    const [softwareSkills, setSoftwareSkills] = useState([]);

    // Predefined skills from DB
    const [predefinedSkills, setPredefinedSkills] = useState({
        household: [],
        professional: [],
        software: []
    });

    useEffect(() => {
        const fetchProfileAndSkills = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch profile
                const pRes = axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, {
                    headers: { 'x-auth-token': token }
                });

                // Fetch skills
                const sRes = axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/skills`);

                const [res, skillsRes] = await Promise.all([pRes, sRes]);

                if (skillsRes.data.success) {
                    setPredefinedSkills(skillsRes.data.data);
                }

                const data = res.data.data;
                setProfile({
                    ...data,
                    servicesProvided: data.servicesProvided ? JSON.parse(data.servicesProvided) : [],
                    skillsets: data.skillsets ? JSON.parse(data.skillsets) : { household: [], professional: [], software: [] }
                });

                setBio(data.bio || '');
                setMainSkill(data.mainSkill || '');

                const services = data.servicesProvided ? JSON.parse(data.servicesProvided) : [];
                setServicesText(services.join(', '));

                const skills = data.skillsets ? JSON.parse(data.skillsets) : { household: [], professional: [], software: [] };

                // Ensure they are arrays
                setHouseholdSkills(Array.isArray(skills.household) ? skills.household : []);
                setProfessionalSkills(Array.isArray(skills.professional) ? skills.professional : []);
                setSoftwareSkills(Array.isArray(skills.software) ? skills.software : []);

            } catch (error) {
                console.error('Error fetching profile or skills', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileAndSkills();
    }, []);

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
            default:
                return;
        }

        if (currentSkills.includes(skill)) {
            setFunc(currentSkills.filter(s => s !== skill));
        } else {
            setFunc([...currentSkills, skill]);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const updatedData = {
                bio,
                mainSkill,
                servicesProvided: servicesText.split(',').map(s => s.trim()).filter(s => s),
                skillsets: {
                    household: householdSkills,
                    professional: professionalSkills,
                    software: softwareSkills
                }
            };

            const res = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, updatedData, {
                headers: { 'x-auth-token': token }
            });

            alert('Profile saved successfully!');
            // Update auth context if needed
        } catch (error) {
            console.error('Error saving profile', error);
            alert('Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted">Loading profile...</div>;

    return (
        <div className="card glass-panel" style={{ padding: '32px', width: '100%' }}>
            <div className="card-header pb-0 flex-between" style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><User className="inline-icon" size={24} /> My Profile</h2>
                    <p className="text-muted" style={{ margin: '8px 0 0 0' }}>Manage your skills and services</p>
                </div>
                <div className="text-right">
                    <span className="badge secondary mb-2" style={{ padding: '6px 12px', fontSize: '14px' }}>Points: {profile?.points || 0}</span>
                    <br />
                    <span className="badge" style={{ padding: '6px 12px', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>Rating: {profile?.rating || 5.0} ⭐</span>
                </div>
            </div>
            <div className="card-body">
                <form onSubmit={handleSave} className="flex-col gap-4">
                    <div className="form-group gap-2">
                        <label className="text-sm text-muted">Bio</label>
                        <textarea
                            className="input p-2 rounded w-full"
                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: 'white' }}
                            rows="3"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell the community about yourself..."
                        />
                    </div>

                    <div className="form-group gap-2 mt-4">
                        <label className="text-sm text-muted">Main Skill (Headline)</label>
                        <input
                            type="text"
                            className="input p-2 rounded w-full"
                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: 'white' }}
                            value={mainSkill}
                            onChange={(e) => setMainSkill(e.target.value)}
                            placeholder="e.g. Master Plumber & React DEV"
                        />
                    </div>

                    <div className="line mt-6 mb-6" style={{ height: '1px', background: 'var(--panel-border)' }}></div>
                    <h3 className="text-lg mb-4">Services Offered</h3>

                    <div className="form-group gap-2">
                        <label className="text-sm text-muted">Services you provide (comma separated)</label>
                        <input
                            type="text"
                            className="input p-2 rounded w-full"
                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: 'white' }}
                            value={servicesText}
                            onChange={(e) => setServicesText(e.target.value)}
                            placeholder="Plumbing, Web Design, Dog Walking..."
                        />
                    </div>

                    <div className="line mt-6 mb-6" style={{ height: '1px', background: 'var(--panel-border)' }}></div>
                    <h3 className="text-lg mb-2">Categorized Skillsets</h3>
                    <p className="text-sm text-muted mb-4">Select the skills you possess from the predefined categories.</p>

                    <div style={{ background: 'var(--bg-dark)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
                        {/* Tabs Header */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
                            <div
                                onClick={() => setActiveTab('household')}
                                style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'household' ? '2px solid var(--accent-cyan)' : '2px solid transparent', color: activeTab === 'household' ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: activeTab === 'household' ? '600' : 'normal', transition: 'all 0.2s' }}
                            >
                                <Home size={16} /> Household
                            </div>
                            <div
                                onClick={() => setActiveTab('professional')}
                                style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'professional' ? '2px solid var(--accent-indigo)' : '2px solid transparent', color: activeTab === 'professional' ? 'var(--accent-indigo)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: activeTab === 'professional' ? '600' : 'normal', transition: 'all 0.2s' }}
                            >
                                <Briefcase size={16} /> Professional
                            </div>
                            <div
                                onClick={() => setActiveTab('software')}
                                style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'software' ? '2px solid var(--accent-purple)' : '2px solid transparent', color: activeTab === 'software' ? 'var(--accent-purple)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: activeTab === 'software' ? '600' : 'normal', transition: 'all 0.2s' }}
                            >
                                <Monitor size={16} /> Software
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div style={{ padding: '24px' }}>
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

                    <button type="submit" className="btn primary mt-8" disabled={saving} style={{ padding: '12px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
