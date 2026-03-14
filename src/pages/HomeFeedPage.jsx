import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter } from 'lucide-react';
import { fetchPosts, fetchUsers } from '../services/api';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { AppContext } from '../context/AppContext';

const HomeFeedPage = () => {
  const { posts: globalPosts, syncPosts, followedUsers } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'following'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'az'

  const loadData = async (pageNum = 1, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    
    setError('');

    try {
      const [fetchedPosts, usersData] = await Promise.all([
        fetchPosts(pageNum, 10),
        fetchUsers() // In a real app, only fetch users needed, but JSONPlaceholder users is just 10 items.
      ]);

      if (fetchedPosts.length === 0) {
        setHasMore(false);
      }
      
      const userMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      const postsWithUsers = fetchedPosts.map(post => ({
        ...post,
        user: userMap[post.userId]
      }));

      // Merge with AppContext (handles locally created/deleted posts)
      const currentAPIState = isInitial ? postsWithUsers : [...globalPosts.filter(p => !p.id.toString().startsWith('local-')), ...postsWithUsers];
      syncPosts(currentAPIState);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load the feed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData(1, true);
  }, []);

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loadingMore && hasMore && !loading) {
      setPage(prev => {
        const next = prev + 1;
        loadData(next, false);
        return next;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loading]);

  // Apply filters and sorting to the globally synced posts
  let displayedPosts = globalPosts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase())
  );

  if (filterMode === 'following') {
    displayedPosts = displayedPosts.filter(post => followedUsers.includes(post.userId));
  }

  if (sortBy === 'az') {
    displayedPosts = [...displayedPosts].sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <div className="home-feed">
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ flex: 1, marginBottom: 0 }}>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search posts by title..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select 
          value={filterMode} 
          onChange={(e) => setFilterMode(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
        >
          <option value="all">All Posts</option>
          <option value="following">Following</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
        >
          <option value="newest">Newest</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => loadData(1, true)} />}
      
      {loading ? (
        <Loader />
      ) : (
        <>
          {displayedPosts.length > 0 ? (
            displayedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
             <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem'}}>
                {!error && "No posts found matching your criteria."}
             </div>
          )}
          
          {loadingMore && <Loader />}
          {!hasMore && !loadingMore && displayedPosts.length > 0 && (
            <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem'}}>
              You have reached the end of the feed.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomeFeedPage;
