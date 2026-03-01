import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Zap, Trophy, TrendingUp, Target, UserCheck, Star, Database } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [loadingDemo, setLoadingDemo] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users`);
                setAllUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users for dashboard list", err);
            }
        };
        fetchUsers();
    }, [loadingDemo]); // refetch when demo data loads

    // Dynamic Matches & Leaderboard calculation
    // Only show real people who have logged in or from demo data (excluding self)
    const otherUsers = allUsers.filter(u => u.id !== user?.id);

    // Sort for leaderboard based on points
    const sortedLeaderboard = [...allUsers].sort((a, b) => (b.points || 0) - (a.points || 0));

    // Grab top 3 and add current user
    let dynamicLeaderboard = sortedLeaderboard.slice(0, 3).map((u, i) => ({
        name: u.name,
        points: u.points || 0,
        rank: i + 1,
        isMe: u.id === user?.id
    }));

    // Ensure current user is in leaderboard view if not in top 3
    if (!dynamicLeaderboard.find(lb => lb.name === user?.name)) {
        const myRank = sortedLeaderboard.findIndex(u => u.id === user?.id) + 1;
        dynamicLeaderboard.push({
            name: 'You',
            points: user?.points || 0,
            rank: myRank > 0 ? myRank : '-',
            isMe: true
        });
    } else {
        // Find me in the list and rename to "You"
        const meItem = dynamicLeaderboard.find(lb => lb.isMe);
        if (meItem) meItem.name = 'You';
    }

    // Smart Matches (Just grab up to 2 other users if they exist)
    const dynamicMatches = otherUsers.slice(0, 2).map((u) => ({
        id: u.id,
        name: u.name,
        skillOffered: u.mainSkill || 'General',
        skillNeeded: 'Any', // Mock for now
        matchPercentage: Math.floor(Math.random() * (99 - 80 + 1)) + 80, // 80-99%
        distance: Number((Math.random() * 5).toFixed(1))
    }));

    const handleLoadDemoData = async () => {
        setLoadingDemo(true);
        try {
            let lat = user?.lat;
            let lng = user?.lng;

            if (!lat || !lng) {
                // Try to get current location
                const position = await new Promise((resolve, reject) => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    } else {
                        reject(new Error("Geolocation not supported"));
                    }
                }).catch(() => null);

                if (position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                }
            }

            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/demo`, { lat, lng });
            alert(res.data.message + ' Check Map, Chat, and Requests.');
        } catch (e) {
            console.error(e);
            alert('Failed to load demo data');
        } finally {
            setLoadingDemo(false);
        }
    };

    return (
        <>
            {/* Welcome banner spanning top */}
            <section className="col-span-12 glass-panel card" style={{ padding: '32px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{user?.name?.split(' ')[0] || 'User'}</span> 👋</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>You have <strong style={{ color: 'var(--text-main)' }}>3 new requests</strong> nearby matching your skills.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button
                        className="btn secondary"
                        onClick={handleLoadDemoData}
                        disabled={loadingDemo}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Database size={16} /> {loadingDemo ? 'Loading...' : 'Load Demo Data'}
                    </button>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-emerald)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Community Status</div>
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>Trusted Member</div>
                    </div>
                </div>
            </section>

            {/* Left Column - Profile & Stats (8 cols) */}
            <div className="col-span-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>

                {/* Stats Row */}
                <div className="glass-panel card">
                    <div className="card-header">
                        <h2><TrendingUp className="icon-blue" size={20} /> Impact Overview</h2>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card stat-bg-blue">
                            <div className="stat-value">15</div>
                            <div className="stat-label">Exchanges</div>
                        </div>
                        <div className="stat-card stat-bg-purple">
                            <div className="stat-value">{user?.rating || '5.0'}</div>
                            <div className="stat-label">Rating</div>
                            <div style={{ position: 'absolute', top: 10, right: 10, color: 'var(--accent-amber)' }}><Star size={16} fill="currentColor" /></div>
                        </div>
                        <div className="stat-card stat-bg-green">
                            <div className="stat-value">8</div>
                            <div className="stat-label">Endorsements</div>
                        </div>
                    </div>
                </div>

                {/* Profile Skills */}
                <div className="glass-panel card">
                    <div className="card-header">
                        <h2><Target className="icon-purple" size={20} /> Your Skill Graph</h2>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Edit Skills</button>
                    </div>

                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Primary Expertise:</span>
                        <span className="badge badge-outline-cyan" style={{ fontSize: '13px', padding: '6px 16px' }}>{user?.mainSkill || 'Not set'}</span>
                    </div>

                    <ul className="modern-list">
                        <li className="list-item">
                            <div className="item-icon-wrap bg-cyan-soft">💻</div>
                            <div className="item-content">
                                <div className="item-title">Web Development <span className="badge badge-outline-cyan">OFFERING</span></div>
                                <div className="item-subtitle">Expert Level • Taught 4 sessions</div>
                            </div>
                        </li>
                        <li className="list-item">
                            <div className="item-icon-wrap bg-rose-soft">🎸</div>
                            <div className="item-content">
                                <div className="item-title">Guitar Lessons <span className="badge badge-outline-rose">SEEKING</span></div>
                                <div className="item-subtitle">Beginner Level • Looking for acoustic</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Column - Smart Matches & Leaderboard (4 cols) */}
            <div className="col-span-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>

                {/* Smart Matches AI Feature */}
                <div className="glass-panel card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: 'var(--accent-indigo)' }}><Zap size={120} /></div>
                    <div className="card-header" style={{ position: 'relative', zIndex: 2 }}>
                        <h2><Zap className="icon-purple" size={20} fill="currentColor" /> Smart Matches</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 0, marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                        AI-curated neighbors whose skills perfectly align with yours.
                    </p>

                    <ul className="modern-list" style={{ gap: '12px', position: 'relative', zIndex: 2 }}>
                        {dynamicMatches.length > 0 ? dynamicMatches.map(match => (
                            <li key={match.id} className="list-item" style={{ padding: '12px', cursor: 'pointer' }}>
                                <div className="item-avatar" style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {match.name.charAt(0)}
                                </div>
                                <div className="item-content" style={{ marginLeft: '12px' }}>
                                    <div className="item-title" style={{ fontSize: '14px' }}>{match.name} <span style={{ color: 'var(--accent-emerald)', fontSize: '12px' }}>{match.matchPercentage}% Match</span></div>
                                    <div className="item-subtitle" style={{ fontSize: '11px' }}>Has {match.skillOffered} • Needs {match.skillNeeded}</div>
                                </div>
                            </li>
                        )) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                                Not enough users in the area to calculate matches. Try loading Demo Data!
                            </div>
                        )}
                    </ul>
                </div>

                {/* Leaderboard Feature */}
                <div className="glass-panel card">
                    <div className="card-header">
                        <h2><Trophy className="icon-orange" size={20} /> Leaderboard</h2>
                    </div>

                    <ul className="modern-list" style={{ gap: '8px' }}>
                        {dynamicLeaderboard.map((lb, idx) => (
                            <li key={idx} className="list-item" style={{ padding: '10px 16px', background: lb.isMe ? 'rgba(14, 165, 233, 0.1)' : 'transparent', border: lb.isMe ? '1px solid rgba(14, 165, 233, 0.3)' : 'none' }}>
                                <div className={`leaderboard-rank rank-${lb.rank}`}>{lb.rank}</div>
                                <div className="item-content" style={{ marginLeft: '16px' }}>
                                    <div className="item-title" style={{ fontSize: '14px' }}>{lb.name}</div>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '14px' }}>
                                    {lb.points} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>pts</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </>
    );
};

export default Dashboard;
