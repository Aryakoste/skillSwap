import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Send } from 'lucide-react';

const PostsView = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/posts`);
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/posts`, {
                title,
                content,
                userId: user.id
            });
            setPosts([res.data, ...posts]);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="posts-container" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={24} /> Community Board
                </h2>
                <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        className="input-field"
                        type="text"
                        placeholder="Post Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ flex: 1, borderRadius: '24px', padding: '14px 20px', background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: 'white' }}
                        required
                    />
                    <textarea
                        className="input-field"
                        placeholder="What's on your mind? Share knowledge, ask for help..."
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        style={{ resize: 'vertical', flex: 1, borderRadius: '24px', padding: '14px 20px', background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: 'white' }}
                    ></textarea>

                    <button type="submit" className="action-button primary" disabled={loading} style={{ cursor: 'pointer', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', color: 'white', border: 'medium', boxShadow: 'rgba(14, 165, 233, 0.4) 0px 4px 15px' }}>
                        <Send size={16} /> {loading ? 'Posting...' : 'Post'}
                    </button>
                </form>
            </div>

            <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {posts.map(post => (
                    <div key={post.id} className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                    {post.user?.initials || 'U'}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{post.user?.name || 'Unknown User'}</h4>
                                    <small className="text-muted">{new Date(post.createdAt).toLocaleString()}</small>
                                </div>
                            </div>
                        </div>
                        <h3 style={{ marginTop: '0', marginBottom: '8px' }}>{post.title}</h3>
                        <p style={{ margin: 0, lineHeight: '1.5' }}>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostsView;
