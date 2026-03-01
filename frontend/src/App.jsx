import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import RequestsBoard from './pages/RequestsBoard';
import NearbyUsers from './pages/NearbyUsers';
import PostsView from './pages/PostsView';
import ChatView from './pages/ChatView';
import MapArea from './pages/MapArea';
import Profile from './pages/Profile';

import {
  Home,
  List,
  MapPin,
  LogOut,
  Zap,
  MessageSquare,
  MessageCircle,
  Map as MapIcon,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="app-bg">
      <div className="app-container">

        {/* Header Section */}
        <header className="header-card glass-panel fade-in delay-1">
          <div className="logo-wrap">
            <div className="logo-icon">🤝</div>
            <div>
              <h1 className="logo-title">SkillSwap</h1>
              <p className="logo-sub">Connect. Learn. Grow Together.</p>
            </div>
          </div>
          <div className="user-pill" title="Profile/Logout">
            <span className="user-points">⭐ {user?.points || 0} pts</span>
            <Link to="/profile" className="flex items-center text-inherit no-underline">
              <div className="user-avatar" style={{ marginLeft: '8px' }}>{user?.initials || 'U'}</div>
            </Link>
            <LogOut size={16} className="ml-2 text-muted" style={{ marginLeft: 8, cursor: 'pointer' }} onClick={logout} />
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="tabs-container fade-in delay-2">
          <nav className="tabs">
            <Link to="/dashboard" className={`tab ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <Home size={18} style={{ marginRight: 8 }} /> Dashboard
            </Link>
            <Link to="/requests" className={`tab ${location.pathname === '/requests' ? 'active' : ''}`}>
              <List size={18} style={{ marginRight: 8 }} /> Requests
            </Link>
            <Link to="/posts" className={`tab ${location.pathname === '/posts' ? 'active' : ''}`}>
              <MessageSquare size={18} style={{ marginRight: 8 }} /> Community
            </Link>
            <Link to="/chat" className={`tab ${location.pathname === '/chat' ? 'active' : ''}`}>
              <MessageCircle size={18} style={{ marginRight: 8 }} /> Chat
            </Link>
            <Link to="/map" className={`tab ${location.pathname === '/map' ? 'active' : ''}`}>
              <MapIcon size={18} style={{ marginRight: 8 }} /> Global Map
            </Link>
            <Link to="/nearby" className={`tab ${location.pathname === '/nearby' ? 'active' : ''}`}>
              <MapPin size={18} style={{ marginRight: 8 }} /> Radar
            </Link>
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="bento-grid fade-in delay-3" style={{ animationFillMode: 'forwards' }}>
          {children}
        </main>

      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><Layout><RequestsBoard /></Layout></ProtectedRoute>} />
      <Route path="/posts" element={<ProtectedRoute><Layout><PostsView /></Layout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Layout><ChatView /></Layout></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><Layout><MapArea /></Layout></ProtectedRoute>} />
      <Route path="/nearby" element={<ProtectedRoute><Layout><NearbyUsers /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
