import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Navigation } from 'lucide-react';

const NearbyUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState({});

    useEffect(() => {
        fetchNearby();
    }, []);

    const fetchNearby = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/nearby`);
            // Adding mock positions for the radar visualization
            const mappedUsers = res.data.data.map(u => {
                // Generate a random angle and scale distance for visual representation
                const angle = Math.random() * 2 * Math.PI;
                // Max radius is 200px, map max 10km to 200px -> multiply by 20
                const radius = Math.min(u.distanceKm * 20, 180);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return { ...u, x, y };
            });
            setUsers(mappedUsers.sort((a, b) => a.distanceKm - b.distanceKm));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/${userId}/connect`);
            setConnected(prev => ({ ...prev, [userId]: true }));
        } catch (e) {
            console.error(e);
            alert('Failed to connect');
        }
    };

    return (
        <>
            <section className="col-span-12 glass-panel card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin className="icon-blue" /> Skill Radar
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Real-time scan of skilled neighbors around you in a 10km radius.</p>
                </div>
                <button className="btn btn-primary" onClick={fetchNearby} disabled={loading}>
                    <Navigation size={16} /> {loading ? 'Scanning...' : 'Rescan Area'}
                </button>
            </section>

            <div className="col-span-12 glass-panel card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="radar-container" style={{ height: '400px' }}>
                        <div className="radar-sweep" style={{ animationDuration: '2s' }}></div>
                        <div className="radar-center-me"></div>
                        <div style={{ position: 'absolute', bottom: 20, color: 'var(--accent-cyan)' }}>Initializing Scan...</div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="radar-container" style={{ height: '400px', display: 'flex', flexDirection: 'column', color: 'var(--text-muted)' }}>
                        <MapPin size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                        <p>No neighbors found in your immediate vicinity.</p>
                    </div>
                ) : (
                    <div className="radar-container" style={{ height: '500px' }}>
                        {/* Radar Grid UI */}
                        <div className="radar-circle radar-c1"></div>
                        <div className="radar-circle radar-c2"></div>
                        <div className="radar-circle radar-c3"></div>
                        <div className="radar-sweep"></div>

                        {/* Current User in Center */}
                        <div className="radar-center-me"></div>

                        {/* Neighbor Nodes */}
                        {users.map((u, i) => (
                            <div
                                key={u.id}
                                className="radar-node bg-cyan-soft delay-1 fade-in"
                                style={{ left: `calc(50% + ${u.x}px)`, top: `calc(50% + ${u.y}px)`, animationDelay: `${i * 0.15}s` }}
                            >
                                <div className="radar-node-dot">{u.initials}</div>
                                <div className="radar-node-info">
                                    <strong style={{ color: 'white', display: 'block' }}>{u.name}</strong>
                                    <span style={{ color: 'var(--accent-cyan)' }}>{u.distanceKm} km away</span><br />
                                    Offers: {u.mainSkill}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* List View Details */}
            <div className="col-span-12 glass-panel card mt-4">
                <div className="card-header">
                    <h2><Navigation className="icon-purple" size={20} /> Targets Accquired</h2>
                </div>
                {users.length > 0 && (
                    <div className="request-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                        {users.map(u => (
                            <div key={u.id} className="request-card" style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div className="user-avatar" style={{ width: 44, height: 44, fontSize: '16px' }}>{u.initials}</div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px' }}>{u.name}</h3>
                                        <div style={{ color: 'var(--accent-amber)', fontSize: '12px', fontWeight: 600 }}>⭐ {u.rating} Rating</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    <strong>Offering:</strong> <span style={{ color: 'var(--text-main)' }}>{u.mainSkill}</span>
                                </div>
                                <div className="request-tags" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--panel-border)' }}>
                                    <span className="pill pill-blue">📍 {u.distanceKm} km</span>
                                    <button
                                        className={`btn ${connected[u.id] ? 'btn-secondary' : 'btn-primary'}`}
                                        style={{ padding: '4px 10px', fontSize: '11px', marginLeft: 'auto' }}
                                        onClick={() => handleConnect(u.id)}
                                        disabled={connected[u.id]}
                                    >
                                        {connected[u.id] ? 'Request Sent' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default NearbyUsers;
