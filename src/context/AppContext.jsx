import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const AppContext = createContext();

// Simulated Global State for saving Posts locally so CRUD operations persist while exploring the app
export const AppProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);

  // Load bookmarks & follows from local storage
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts')) || [];
    const savedFollows = JSON.parse(localStorage.getItem('followedUsers')) || [];
    setBookmarkedPosts(savedBookmarks);
    setFollowedUsers(savedFollows);
  }, []);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem('bookmarkedPosts', JSON.stringify(bookmarkedPosts));
  }, [bookmarkedPosts]);

  useEffect(() => {
    localStorage.setItem('followedUsers', JSON.stringify(followedUsers));
  }, [followedUsers]);

  // Merge freshly fetched API posts with any local custom posts / edits
  const syncPosts = (apiPosts) => {
    // A mapping approach: Local state overrides API state if IDs match. New local posts appended.
    const localPosts = JSON.parse(localStorage.getItem('localPosts')) || [];
    const localDeleted = JSON.parse(localStorage.getItem('localDeletedPosts')) || [];

    // Filter out logically deleted API posts
    let merged = apiPosts.filter(p => !localDeleted.includes(p.id));

    // Update existing API posts with local edits
    merged = merged.map(p => {
      const localEdit = localPosts.find(lp => lp.id === p.id);
      return localEdit ? localEdit : p;
    });

    // Append entirely new local posts ensuring no duplicates
    const newLocalPosts = localPosts.filter(lp => typeof lp.id === 'string' && lp.id.startsWith('local-'));
    merged = [...newLocalPosts, ...merged];

    setPosts(merged);
    return merged;
  };

  // Create
  const createPost = (title, body, mediaUrl = '', mediaType = 'none') => {
    const newPost = {
      id: `local-${Date.now()}`, // Temporary local ID
      title,
      body,
      mediaUrl,
      mediaType,
      userId: currentUser.id,
      user: currentUser, // attaching user model directly for frontend
    };

    setPosts([newPost, ...posts]);
    
    // Save locally
    const existingLocal = JSON.parse(localStorage.getItem('localPosts')) || [];
    localStorage.setItem('localPosts', JSON.stringify([newPost, ...existingLocal]));
  };

  // Edit
  const editPost = (id, newTitle, newBody) => {
    const updatedPosts = posts.map(p => 
      p.id === id ? { ...p, title: newTitle, body: newBody } : p
    );
    setPosts(updatedPosts);

    // Save locally
    const existingLocal = JSON.parse(localStorage.getItem('localPosts')) || [];
    const editIndex = existingLocal.findIndex(p => p.id === id);
    if(editIndex >= 0) {
      existingLocal[editIndex] = { ...existingLocal[editIndex], title: newTitle, body: newBody };
    } else {
      // It was an API post edited for the first time locally
      const original = posts.find(p => p.id === id);
      existingLocal.push({ ...original, title: newTitle, body: newBody });
    }
    localStorage.setItem('localPosts', JSON.stringify(existingLocal));
  };

  // Delete
  const deletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));

    const localDeleted = JSON.parse(localStorage.getItem('localDeletedPosts')) || [];
    localStorage.setItem('localDeletedPosts', JSON.stringify([...localDeleted, id]));
    
    // clean up bookmarked just in case
    if(bookmarkedPosts.includes(id)) toggleBookmark(id);
  };

  // Bookmarks
  const toggleBookmark = (postId) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(prev => prev.filter(id => id !== postId));
    } else {
      setBookmarkedPosts(prev => [...prev, postId]);
    }
  };

  // Follow
  const toggleFollow = (userId) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setFollowedUsers(prev => [...prev, userId]);
    }
  };

  return (
    <AppContext.Provider value={{
      posts, syncPosts, createPost, editPost, deletePost,
      bookmarkedPosts, toggleBookmark,
      followedUsers, toggleFollow
    }}>
      {children}
    </AppContext.Provider>
  );
};
