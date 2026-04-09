import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { fetchPostById } from '../services/api';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import { Search, Grid, List, Bookmark, HardDriveDownload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SavedPostsPage.css';

const SavedPostsPage = () => {
  const { bookmarkedPosts } = useContext(AppContext);
  const [savedData, setSavedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSavedPosts = async () => {
      setLoading(true);
      try {
        const localPosts = JSON.parse(localStorage.getItem('localPosts')) || [];
        const fetchedPosts = await Promise.all(
          bookmarkedPosts.map(async (id) => {
            if (typeof id === 'string' && id.startsWith('local-')) {
              return localPosts.find(p => p.id === id);
            }
            const localEdit = localPosts.find(p => p.id === id);
            if (localEdit) return localEdit;
            return await fetchPostById(id);
          })
        );
        setSavedData(fetchedPosts.filter(p => !!p));
      } catch (err) {
        console.error("Error loading saved posts", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookmarkedPosts.length > 0) {
      loadSavedPosts();
    } else {
      setLoading(false);
      setSavedData([]);
    }
  }, [bookmarkedPosts]);

  const filteredPosts = savedData.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="saved-posts-container">
      <div className="saved-posts-header">
        <div className="title-section">
          <div className="icon-wrapper">
            <Bookmark size={28} className="title-icon" fill="currentColor" />
          </div>
          <div>
            <h2>Your Collections</h2>
            <p className="subtitle">Curated ideas, inspiration, and articles.</p>
          </div>
        </div>

        {savedData.length > 0 && (
          <div className="controls-section">
            <div className="search-box">
              <Search size={18} className="search-icon-inline" />
              <input 
                type="text" 
                placeholder="Search saved posts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="view-toggles">
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={20} />
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : savedData.length > 0 ? (
        <div className={`posts-layout ${viewMode}`}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, i) => (
              <div key={post.id} className="post-wrapper" style={{ animationDelay: `${i * 0.05}s` }}>
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Search size={48} className="empty-icon" />
              <h3>No matches found</h3>
              <p>We couldn't find anything matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state full-page">
          <div className="empty-icon-wrapper">
            <HardDriveDownload size={64} className="empty-icon floating" />
          </div>
          <h3>Nothing saved yet</h3>
          <p>When you see something you like, click the bookmark icon to save it here.</p>
          <button className="explore-btn" onClick={() => navigate('/')}>
            Explore Feed
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedPostsPage;
