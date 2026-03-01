import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { Send, User as UserIcon, MessageSquare, Paperclip, Users, X } from 'lucide-react';

const ChatView = () => {
    const { user } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null); // Can be a User or a Group
    const [isGroupSelected, setIsGroupSelected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect to Socket.io
        socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
            socketRef.current.emit('join', user.id);
        });

        socketRef.current.on('receive_message', (msg) => {
            setMessages(prev => {
                // If it's a message for the currently selected chat or sent by us, add it
                return [...prev, msg];
            });
            // Also refresh contacts to show latest interaction if it's a new contact
            fetchContacts();
        });

        fetchContacts();
        fetchGroups();

        return () => {
            socketRef.current.disconnect();
        };
    }, [user.id]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchContacts = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users`);
            setContacts(res.data.filter(u => u.id !== user.id));
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/groups`);
            setGroups(res.data.data || []);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const loadChatHistory = async (contact, isGroup = false) => {
        setSelectedContact(contact);
        setIsGroupSelected(isGroup);
        try {
            if (isGroup) {
                // Join socket room
                socketRef.current.emit('join_group', contact.id);
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/groups/${contact.id}/messages`, {
                    headers: { 'x-auth-token': token }
                });
                setMessages(res.data.data || []);
            } else {
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat/history/${user.id}/${contact.id}`);
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat/upload`, formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setAttachment(res.data);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment) || !selectedContact) return;

        const data = {
            senderId: user.id,
            content: newMessage,
            fileUrl: attachment ? attachment.fileUrl : null,
            fileType: attachment ? attachment.fileType : null
        };

        if (isGroupSelected) {
            data.groupId = selectedContact.id;
        } else {
            data.receiverId = selectedContact.id;
        }

        socketRef.current.emit('send_message', data);
        setNewMessage('');
        setAttachment(null);
    };

    return (
        <div className="chat-container glass-panel" style={{ gridColumn: '1 / -1', display: 'flex', height: '70vh', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Sidebar with Contacts */}
            <div className="contacts-sidebar" style={{ width: '30%', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ margin: 0 }}>Groups</h3>
                </div>
                <div className="contacts-list">
                    {groups.map(group => (
                        <div
                            key={`group-${group.id}`}
                            onClick={() => loadChatHistory(group, true)}
                            style={{
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                background: selectedContact?.id === group.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', flexShrink: 0, background: 'var(--accent-indigo)' }}>
                                <Users size={16} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{group.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{group.category || 'General'}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ margin: 0 }}>Direct Messages</h3>
                </div>
                <div className="contacts-list">
                    {contacts.map(contact => (
                        <div
                            key={`user-${contact.id}`}
                            onClick={() => loadChatHistory(contact, false)}
                            style={{
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                background: selectedContact?.id === contact.id && !isGroupSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', flexShrink: 0 }}>
                                {contact.initials || 'U'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{contact.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{contact.mainSkill || 'SkillSwap User'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--panel-bg)', position: 'relative' }}>
                {/* Chat Background Pattern */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(var(--accent-cyan) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }}></div>

                {selectedContact ? (
                    <>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                            <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '18px', boxShadow: '0 0 15px rgba(14, 165, 233, 0.3)' }}>
                                {selectedContact.initials}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', letterSpacing: '0.5px' }}>{selectedContact.name}</h3>
                        </div>

                        <div className="messages-container" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 5 }}>
                            {messages.map((msg, index) => {
                                const isMine = msg.senderId === user.id;
                                return (
                                    <div key={index} style={{
                                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                                        maxWidth: '65%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        animation: 'fadeIn 0.3s ease-out'
                                    }}>
                                        {!isMine && isGroupSelected && msg.sender && (
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-cyan)', marginLeft: '12px' }}>
                                                {msg.sender.name}
                                            </div>
                                        )}
                                        <div style={{
                                            background: isMine ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))' : 'rgba(30, 41, 59, 0.9)',
                                            color: '#fff',
                                            padding: '14px 18px',
                                            borderRadius: '20px',
                                            borderBottomRightRadius: isMine ? '4px' : '20px',
                                            borderBottomLeftRadius: isMine ? '20px' : '4px',
                                            boxShadow: isMine ? '0 8px 16px -4px rgba(99, 102, 241, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                                            border: isMine ? 'none' : '1px solid var(--panel-border)',
                                            fontSize: '15px',
                                            lineHeight: '1.5'
                                        }}>
                                            {msg.fileUrl && (
                                                <div style={{ marginBottom: '10px' }}>
                                                    {msg.fileType?.startsWith('image/') ? (
                                                        <img src={`http://localhost:5000${msg.fileUrl}`} alt="attachment" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '250px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: isMine ? '#fff' : 'var(--accent-cyan)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                                            <Paperclip size={16} /> Download File
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.content && <div style={{ wordBreak: 'break-word' }}>{msg.content}</div>}
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px', textAlign: isMine ? 'right' : 'left', alignSelf: isMine ? 'flex-end' : 'flex-start', padding: '0 4px' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--panel-border)', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                            {attachment && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '12px', width: 'fit-content' }}>
                                    <Paperclip size={14} />
                                    <span style={{ fontSize: '0.85rem' }}>{attachment.fileName}</span>
                                    <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: '8px' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    className="action-button secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{ padding: '12px' }}
                                    title="Attach File"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{ flex: 1, borderRadius: '24px', padding: '14px 20px', background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: 'white' }}
                                />
                                <button type="submit" className="action-button primary" disabled={(!newMessage.trim() && !attachment) || uploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <MessageSquare size={64} style={{ marginBottom: '16px' }} />
                        <h2>Select a contact to start chatting</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;
