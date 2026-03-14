import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { fetchPostById } from '../services/api';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';

const SavedPostsPage = () => {
  const { bookmarkedPosts } = useContext(AppContext);
  const [savedData, setSavedData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader />;

  return (
    <div className="home-feed">
      <h2 style={{ marginBottom: '1.5rem' }}>Saved Bookmarks</h2>
      {savedData.length > 0 ? (
        savedData.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
          You have no saved posts yet.
        </div>
      )}
    </div>
  );
};

export default SavedPostsPage;
