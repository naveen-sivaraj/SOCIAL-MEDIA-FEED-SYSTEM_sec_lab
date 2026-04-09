import React, { useState, useContext } from 'react';
import { Heart, MessageCircle, Bookmark, Trash2, Edit2, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommentPreview from './CommentPreview';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 50) + 5); 
  const navigate = useNavigate();

  const { bookmarkedPosts, toggleBookmark, deletePost, followedUsers, toggleFollow } = useContext(AppContext);
  const { currentUser } = useContext(AuthContext);

  const isBookmarked = bookmarkedPosts.includes(post.id);
  const isOwnPost = currentUser?.id === post.userId;
  const isFollowing = followedUsers.includes(post.userId);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleBookmark(post.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    const newTitle = prompt('Edit Title:', post.title);
    const newBody = prompt('Edit Body:', post.body);
    if(newTitle && newBody && newTitle.trim() && newBody.trim()) {
      alert('Post edit simulating... Full Edit Modal coming soon!');
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    alert('Link copied to clipboard!');
  };

  const handleUserClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.userId}`);
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post-card" onClick={handlePostClick} style={{cursor: 'pointer'}}>
      <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="avatar" onClick={handleUserClick} style={{cursor: 'pointer'}}>
            {post.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="author-name" onClick={handleUserClick} style={{ fontWeight: 600 }}>
              {post.user?.name || `User ${post.userId}`}
            </span>
            {!isOwnPost && (
              <span 
                onClick={(e) => { e.stopPropagation(); toggleFollow(post.userId); }}
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isFollowing ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                  color: isFollowing ? 'var(--text-secondary)' : 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  border: isFollowing ? '1px solid var(--border-color)' : 'none'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </span>
            )}
          </div>
        </div>

        {isOwnPost && (
          <div style={{ display: 'flex', gap: '0.5rem'}}>
             <button onClick={handleEdit} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Edit"><Edit2 size={16}/></button>
             <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#ff7b7b', cursor: 'pointer' }} title="Delete"><Trash2 size={16}/></button>
          </div>
        )}
      </div>
      
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-body">{post.body}</p>
        
        {post.mediaType === 'image' && post.mediaUrl && (
          <img src={post.mediaUrl} alt="Post attachment" style={{ width: '100%', borderRadius: '12px', marginTop: '1rem', objectFit: 'cover', maxHeight: '400px' }} />
        )}
        {post.mediaType === 'audio' && post.mediaUrl && (
          <audio controls src={post.mediaUrl} style={{ width: '100%', marginTop: '1rem', borderRadius: '30px' }} onClick={(e) => e.stopPropagation()} />
        )}
        {post.mediaType === 'video' && post.mediaUrl && (
          <video controls src={post.mediaUrl} style={{ width: '100%', borderRadius: '12px', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()} />
        )}
      </div>

      <div className="action-bar" onClick={(e) => e.stopPropagation()} style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem'}}>
          <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <Heart size={20} />
            <span>{likesCount}</span>
          </button>
          <button className="action-btn" onClick={handlePostClick}>
            <MessageCircle size={20} />
            <span>Comments</span>
          </button>
          <button className="action-btn" onClick={handleShare}>
            <Share2 size={20} />
          </button>
        </div>
        
        <button className={`action-btn ${isBookmarked ? 'liked' : ''}`} onClick={handleBookmark} style={{ color: isBookmarked ? 'var(--accent-primary)' : ''}}>
          <Bookmark size={20} fill={isBookmarked ? 'var(--accent-primary)' : 'none'} stroke={isBookmarked ? 'var(--accent-primary)' : 'currentColor'}/>
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <CommentPreview postId={post.id} />
      </div>
    </div>
  );
};

export default PostCard;
