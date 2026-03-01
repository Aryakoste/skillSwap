import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, AlertCircle, Clock, Award, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const RequestsBoard = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [offered, setOffered] = useState({});
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Technology',
        urgency: 'Medium',
        points: 10
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/requests`);
            setRequests(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/requests`, form);
            setRequests([res.data.data, ...requests]);
            setForm({ title: '', description: '', category: 'Technology', urgency: 'Medium', points: 10 });
            setShowForm(false);
            // Optional: Use a toast notification instead of alert in future
        } catch (e) {
            console.error(e);
            alert('Failed to create request');
        } finally {
            setCreating(false);
        }
    };

    const handleAccept = async (reqId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/requests/${reqId}/accept`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Update request in state
            setRequests(requests.map(r => r.id === reqId ? res.data.data : r));
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || 'Failed to accept request');
        }
    };

    const handleComplete = async (reqId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/requests/${reqId}/complete`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Update request in state
            setRequests(requests.map(r => r.id === reqId ? res.data.data : r));
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || 'Failed to complete request');
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency?.toLowerCase()) {
            case 'high':
            case 'emergency': return 'var(--accent-rose)';
            case 'medium': return 'var(--accent-amber)';
            case 'low': return 'var(--accent-cyan)';
            default: return 'var(--accent-amber)';
        }
    };

    return (
        <>
            <section className="col-span-12 glass-panel card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Job Board</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Help your neighbors with a task and earn points for your own requests.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} /> New Request
                </button>
            </section>

            {/* Inline Create Form Modal */}
            {showForm && (
                <div className="col-span-12 glass-panel card fade-in delay-1" style={{ border: '1px solid var(--accent-indigo)', background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))' }}>
                    <div className="card-header">
                        <h2>Post a New Request</h2>
                        <button className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ padding: '4px 8px' }}>Cancel</button>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="input-group">
                            <label className="input-label">Request Title</label>
                            <input
                                className="input"
                                placeholder="E.g., Need help fixing my unicycle"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Details</label>
                            <textarea
                                className="textarea"
                                placeholder="Describe specifically what you need help with..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Category</label>
                                <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="Technology">Technology</option>
                                    <option value="Music">Music</option>
                                    <option value="Education">Education</option>
                                    <option value="Home Services">Home Services</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Urgency</label>
                                <select className="select" value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Bounty Points</label>
                                <input
                                    type="number" className="input" min="5" max="500"
                                    value={form.points}
                                    onChange={e => setForm({ ...form, points: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={creating} style={{ width: '100%', fontSize: '16px', padding: '12px' }}>
                            {creating ? 'Broadcasting...' : 'Broadcast Request to Network'}
                        </button>
                    </form>
                </div>
            )}

            {/* Controls Bar */}
            <div className="col-span-12" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <div className="input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--panel-bg)' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input type="text" placeholder="Search requests..." style={{ border: 'none', background: 'transparent', color: 'white', width: '100%', outline: 'none' }} />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Active Requests Grid */}
            <div className="col-span-12">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading network requests...</div>
                ) : requests.length === 0 ? (
                    <div className="glass-panel card" style={{ textAlign: 'center', padding: '60px' }}>
                        <AlertCircle size={48} className="icon-blue" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                        <h3 style={{ margin: '0 0 8px 0' }}>The board is clear</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Be the first to post a request in your neighborhood!</p>
                    </div>
                ) : (
                    <div className="request-grid fade-in delay-2">
                        {requests.filter(r => r.status !== 'Completed').map(req => (
                            <div key={req.id} className="request-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '1.4', flex: 1, paddingRight: '12px' }}>{req.title}</h3>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <Award size={14} className="icon-orange" />
                                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{req.points}</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 20px 0', lineHeight: '1.5' }}>{req.description}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <div className="user-avatar" style={{ width: 24, height: 24, fontSize: '10px' }}>{req.user?.name ? req.user.name.charAt(0) : 'U'}</div>
                                    <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{req.user?.name || 'Unknown Neighbor'}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {req.distanceKm} km
                                    </span>
                                </div>

                                <div className="request-tags">
                                    <span className="pill pill-blue">{req.category}</span>
                                    <span className="pill" style={{ color: getUrgencyColor(req.urgency), borderColor: getUrgencyColor(req.urgency) }}>{req.urgency}</span>
                                    <span className="pill" style={{ color: req.status === 'Open' ? 'white' : 'var(--accent-green)' }}>{req.status}</span>

                                    <div style={{ marginLeft: 'auto' }}>
                                        {req.userId !== currentUser.id && req.status === 'Open' && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                onClick={() => handleAccept(req.id)}
                                            >
                                                Accept Request
                                            </button>
                                        )}
                                        {req.userId === currentUser.id && req.status === 'Accepted' && (
                                            <button
                                                className="btn"
                                                style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--accent-green)', color: 'white' }}
                                                onClick={() => handleComplete(req.id)}
                                            >
                                                <CheckCircle size={14} style={{ marginRight: '4px', display: 'inline' }} /> Mark as Done
                                            </button>
                                        )}
                                        {req.status === 'Accepted' && req.userId !== currentUser.id && (
                                            <span style={{ fontSize: '12px', color: 'var(--accent-green)' }}>Accepted by You</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default RequestsBoard;
