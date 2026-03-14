import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchUsers } from '../services/api';
import Loader from '../components/Loader';
import { LogIn, UserPlus } from 'lucide-react';

const LoginPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Registration Form State
  const [regData, setRegData] = useState({
    name: '', username: '', email: '', phone: '', website: '', companyName: ''
  });

  const { login, registerUser, localUsers } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        // Merge API users with freshly created Local Users so they can log back into them later
        setUsers([...localUsers, ...data]);
      } catch (err) {
        console.error("Failed to fetch users for login.");
        // If API fails, at least load local users
        setUsers(localUsers);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [localUsers]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    const userToLogin = users.find(u => u.id.toString() === selectedUserId);
    login(userToLogin);
    navigate('/');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regData.name || !regData.username || !regData.email) return;

    // Format matches JSONPlaceholder User Structure
    const newUser = {
      name: regData.name,
      username: regData.username,
      email: regData.email,
      phone: regData.phone || 'N/A',
      website: regData.website || 'N/A',
      company: {
        name: regData.companyName || 'N/A'
      }
    };

    registerUser(newUser);
    navigate('/');
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
      <div className="post-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem 2rem' }}>
        
        <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)' }}>
          <button 
            onClick={() => setActiveTab('login')}
            style={{ 
              flex: 1, padding: '1rem', background: 'none', border: 'none', 
              color: activeTab === 'login' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'login' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: activeTab === 'login' ? '700' : '500', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Log In
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            style={{ 
              flex: 1, padding: '1rem', background: 'none', border: 'none', 
              color: activeTab === 'register' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'register' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: activeTab === 'register' ? '700' : '500', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Select an existing user to log in</p>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
                required
              >
                <option value="" disabled>-- Select a User --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} (@{user.username}) {user.isLocal ? '[Local]' : ''}
                  </option>
                ))}
              </select>
              
              <button 
                type="submit" 
                className="action-btn"
                style={{ justifyContent: 'center', background: 'var(--accent-primary)', color: 'white', padding: '0.8rem', borderRadius: '8px', marginTop: '1rem' }}
              >
                <LogIn size={18} /> Log In
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)', textAlign: 'center' }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>Join the SocialFeed network</p>
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" name="name" placeholder="Full Name *" value={regData.name} onChange={handleRegChange} required className="search-input" style={{ paddingLeft: '1rem' }}/>
              <input type="text" name="username" placeholder="Username *" value={regData.username} onChange={handleRegChange} required className="search-input" style={{ paddingLeft: '1rem' }}/>
              <input type="email" name="email" placeholder="Email Address *" value={regData.email} onChange={handleRegChange} required className="search-input" style={{ paddingLeft: '1rem' }}/>
              <input type="tel" name="phone" placeholder="Phone Number" value={regData.phone} onChange={handleRegChange} className="search-input" style={{ paddingLeft: '1rem' }}/>
              <input type="text" name="website" placeholder="Website" value={regData.website} onChange={handleRegChange} className="search-input" style={{ paddingLeft: '1rem' }}/>
              <input type="text" name="companyName" placeholder="Company Name" value={regData.companyName} onChange={handleRegChange} className="search-input" style={{ paddingLeft: '1rem' }}/>
              
              <button 
                type="submit" 
                className="action-btn"
                style={{ justifyContent: 'center', background: 'var(--accent-secondary)', color: 'white', padding: '0.8rem', borderRadius: '8px', marginTop: '1rem' }}
              >
                <UserPlus size={18} /> Register & Log In
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
