import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Moon, Sun, PlusSquare, Bookmark, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { createPost } = useContext(AppContext);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if(newTitle.trim() && newBody.trim()) {
      createPost(newTitle, newBody, mediaUrl, mediaType);
      setNewTitle('');
      setNewBody('');
      setMediaUrl('');
      setMediaType('none');
      setShowModal(false);
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            <Sparkles size={24} color="var(--accent-primary)" />
            SocialFeed
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button onClick={toggleTheme} className="action-btn" title="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button onClick={() => setShowModal(true)} className="action-btn" title="Create Post">
              <PlusSquare size={20} />
            </button>
            
            <Link to="/saved" className="action-btn" title="Saved Posts">
              <Bookmark size={20} />
            </Link>

            <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => navigate(`/profile/${currentUser.id}`)} title="Profile">
              {currentUser.name.charAt(0)}
            </div>

            <button onClick={handleLogout} className="action-btn" title="Log Out" style={{ color: '#ff7b7b' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <div className="post-card" style={{ width: '90%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Create New Post</h2>
            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Post Title" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '1rem' }}
                required
              />
              <textarea 
                placeholder="What's on your mind?" 
                value={newBody} 
                onChange={e => setNewBody(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '1rem', minHeight: '100px', resize: 'vertical' }}
                required
              />
              <select 
                value={mediaType} 
                onChange={e => setMediaType(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '1rem', cursor: 'pointer' }}
              >
                <option value="none">No Media Attachment</option>
                <option value="image">Picture / Image URL</option>
                <option value="audio">Song / Audio URL</option>
                <option value="video">Video URL</option>
              </select>
              {mediaType !== 'none' && (
                <input 
                  type="url" 
                  placeholder="Paste Media URL here" 
                  value={mediaUrl} 
                  onChange={e => setMediaUrl(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: '1rem' }}
                  required
                />
              )}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="back-btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" className="back-btn" style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '8px' }}>Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
