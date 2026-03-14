import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserById, fetchUserPosts } from '../services/api';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, Globe, Mail, Phone, Building, UserPlus, UserCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { followedUsers, toggleFollow, posts: globalPosts } = useContext(AppContext);
  const { currentUser } = useContext(AuthContext);

  const isFollowing = followedUsers.includes(Number(id));
  const isSelf = currentUser?.id === Number(id);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, userPosts] = await Promise.all([
        fetchUserById(id),
        fetchUserPosts(id)
      ]);
      setUser(userData);
      
      // Connect to global state to account for simulated Edit/Deletes by this user
      // Also get any newly created local posts by this user
      const localDeleted = JSON.parse(localStorage.getItem('localDeletedPosts')) || [];
      const apiRemaining = userPosts.filter(p => !localDeleted.includes(p.id));
      
      const userLocalPosts = globalPosts.filter(p => p.userId === Number(id) && p.id.toString().startsWith('local-'));

      setPosts([...userLocalPosts, ...apiRemaining]);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={loadProfile} />;
  if (!user) return null;

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="post-card profile-card" style={{ position: 'relative' }}>
        
        {!isSelf && (
           <button 
             onClick={() => toggleFollow(Number(id))}
             style={{ 
               position: 'absolute', top: '20px', right: '20px', 
               display: 'flex', alignItems: 'center', gap: '0.5rem',
               padding: '0.6rem 1rem', borderRadius: '20px',
               border: 'none', cursor: 'pointer',
               background: isFollowing ? 'rgba(255,255,255,0.1)' : 'var(--accent-primary)',
               color: isFollowing ? 'var(--text-primary)' : 'white',
               fontWeight: '600'
             }}
           >
             {isFollowing ? <><UserCheck size={16}/> Following</> : <><UserPlus size={16}/> Follow</>}
           </button>
        )}

        <div className="avatar profile-avatar">
          {user.name.charAt(0)}
        </div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-handle">@{user.username}</p>

        <div className="profile-details">
          <div className="detail-item">
            <p><Mail size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Email</p>
            <h4>{user.email}</h4>
          </div>
          <div className="detail-item">
            <p><Phone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Phone</p>
            <h4>{user.phone.split(' ')[0]}</h4>
          </div>
          <div className="detail-item">
            <p><Globe size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Website</p>
            <h4><a href={`http://${user.website}`} target="_blank" rel="noreferrer" style={{color: 'var(--accent-primary)'}}>{user.website}</a></h4>
          </div>
          <div className="detail-item">
            <p><Building size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Company</p>
            <h4>{user.company?.name}</h4>
          </div>
        </div>
      </div>

      <div className="user-posts" style={{ marginTop: '2rem' }}>
        <h3 className="section-title">Posts by {user.name.split(' ')[0]}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          {posts.map(post => (
            <PostCard key={post.id} post={{ ...post, user }} />
          ))}
          {posts.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
