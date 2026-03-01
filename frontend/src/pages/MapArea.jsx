import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Users, Briefcase, MessageSquare } from 'lucide-react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Fix Leaflet's default icon path issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Custom Icons
const userIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: var(--primary); width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">👤</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const reqIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: var(--secondary); width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🛠️</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const MapArea = () => {
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);

    // Default to Mumbai, India
    const defaultCenter = [19.0760, 72.8777];
    const defaultZoom = 12;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, reqRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users`),
                axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/requests`)
            ]);

            // Add some random spread around the center to users
            const usersWithLocations = usersRes.data.map((u) => {
                if (u.lat && u.lng) return u;
                return {
                    ...u,
                    lat: defaultCenter[0] + (Math.random() - 0.5) * 0.1,
                    lng: defaultCenter[1] + (Math.random() - 0.5) * 0.1
                };
            }).filter(u => currentUser ? u.id !== currentUser.id : true);

            setUsers(usersWithLocations);

            // Add some random spread around the center to requests
            const reqsWithLocations = reqRes.data.data.map(r => {
                if (r.lat && r.lng) return r;
                return {
                    ...r,
                    lat: defaultCenter[0] + (Math.random() - 0.5) * 0.15,
                    lng: defaultCenter[1] + (Math.random() - 0.5) * 0.15
                };
            }).filter(r => r.status === 'Open');

            setRequests(reqsWithLocations);
        } catch (error) {
            console.error('Error fetching map data:', error);
        }
    };

    return (
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <MapIcon size={24} /> Skill Explorer Map
                </h2>
                <p className="text-muted" style={{ margin: '8px 0 0 0' }}>
                    Find nearby experts and learners on the global map (using OpenStreetMap).
                </p>
            </div>

            <div className="glass-panel" style={{ height: '600px', borderRadius: '16px', overflow: 'hidden' }}>
                <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* User Markers */}
                    {users.map((u) => (
                        <Marker key={`user-${u.id}`} position={[u.lat, u.lng]} icon={userIcon}>
                            <Popup>
                                <div style={{ textAlign: 'center', minWidth: '180px' }}>
                                    <div className="user-avatar" style={{ width: '40px', height: '40px', margin: '0 auto 8px', fontSize: '1rem' }}>
                                        {u.initials}
                                    </div>
                                    <strong>{u.name}</strong><br />
                                    <span style={{ color: 'var(--primary)', fontSize: '0.9em' }}>{u.mainSkill || 'Community Member'}</span>

                                    {u.servicesProvided && JSON.parse(u.servicesProvided).length > 0 && (
                                        <div style={{ marginTop: '8px', fontSize: '0.85em', textAlign: 'left' }}>
                                            <strong>Services:</strong> {JSON.parse(u.servicesProvided).join(', ')}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '5px', marginBottom: '10px' }}>⭐ {u.rating} ({u.points} pts)</div>

                                    <button
                                        className="btn primary small w-full flex-center justify-center gap-2"
                                        onClick={() => navigate('/chat')}
                                    >
                                        <MessageSquare size={14} /> Message
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Request Markers */}
                    {requests.map((r) => (
                        <Marker key={`req-${r.id}`} position={[r.lat, r.lng]} icon={reqIcon}>
                            <Popup>
                                <div style={{ minWidth: '180px' }}>
                                    <strong style={{ color: 'var(--secondary)' }}>{r.title}</strong>
                                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{r.description.substring(0, 50)}...</p>
                                    <div style={{ fontSize: '0.8em', marginBottom: '10px' }}>
                                        <span className="badge">{r.category}</span>
                                        <span className="badge secondary ml-1">🪙 {r.points}</span>
                                    </div>
                                    <button
                                        className="btn secondary small w-full flex-center justify-center gap-2"
                                        onClick={() => navigate('/requests')}
                                    >
                                        <Briefcase size={14} /> View Request
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapArea;
