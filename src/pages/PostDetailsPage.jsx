import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, fetchCommentsByPostId, fetchUserById } from '../services/api';
import { ArrowLeft, UserCircle2, Send, Edit2, Trash2 } from 'lucide-react';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newComment, setNewComment] = useState('');
  const { posts } = useContext(AppContext);
  const { currentUser } = useContext(AuthContext);

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Check if it's a locally created post or edited post
      const isLocal = typeof id === 'string' && id.startsWith('local-');
      const localPosts = JSON.parse(localStorage.getItem('localPosts')) || [];
      const localEdit = localPosts.find(p => p.id.toString() === id.toString());

      let postData;
      if (isLocal || localEdit) {
        postData = localEdit || posts.find(p => p.id === id);
      } else {
        postData = await fetchPostById(id);
      }
      
      setPost(postData);
      
      const userData = postData.user ? postData.user : await fetchUserById(postData.userId);
      setAuthor(userData);

      // Fetch API comments
      const commentsData = isLocal ? [] : await fetchCommentsByPostId(id);
      
      // Fetch Local comments for this post
      const localComments = JSON.parse(localStorage.getItem('localComments')) || [];
      const postLocalComments = localComments.filter(c => c.postId.toString() === id.toString());
      
      setComments([...postLocalComments, ...commentsData]);
    } catch (err) {
      console.error(err);
      setError('Failed to load post details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleDeleteComment = (commentId) => {
    if(window.confirm('Delete this comment?')) {
      const updated = comments.filter(c => c.id !== commentId);
      setComments(updated);
      const localComments = JSON.parse(localStorage.getItem('localComments')) || [];
      const updatedLocal = localComments.filter(c => c.id !== commentId);
      localStorage.setItem('localComments', JSON.stringify(updatedLocal));
    }
  };

  const handleEditComment = (comment) => {
    const newBody = window.prompt("Edit comment:", comment.body);
    if(newBody && newBody.trim() !== '') {
      const updated = comments.map(c => c.id === comment.id ? { ...c, body: newBody } : c);
      setComments(updated);
      
      const localComments = JSON.parse(localStorage.getItem('localComments')) || [];
      const updatedLocal = localComments.map(c => c.id === comment.id ? { ...c, body: newBody } : c);
      localStorage.setItem('localComments', JSON.stringify(updatedLocal));
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: `local-comment-${Date.now()}`,
      postId: id,
      name: currentUser.name,
      email: currentUser.email,
      body: newComment
    };

    setComments([commentObj, ...comments]);
    setNewComment('');

    // Save to local storage
    const localComments = JSON.parse(localStorage.getItem('localComments')) || [];
    localStorage.setItem('localComments', JSON.stringify([commentObj, ...localComments]));
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={loadDetails} />;
  if (!post) return null;

  return (
    <div className="post-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="post-card" style={{ cursor: 'default' }}>
        <div className="post-header" onClick={() => navigate(`/profile/${author?.id}`)} style={{ cursor: 'pointer' }}>
          <div className="avatar">
            {author?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <span className="author-name">{author?.name || 'Unknown User'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
               {author?.email}
            </span>
          </div>
        </div>

        <div className="post-content" style={{ marginTop: '1rem' }}>
          <h2 className="post-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{post.title}</h2>
          <p className="post-body" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>{post.body}</p>
          
          {post.mediaType === 'image' && post.mediaUrl && (
            <img src={post.mediaUrl} alt="Post attachment" style={{ width: '100%', borderRadius: '16px', marginTop: '1.5rem' }} />
          )}
          {post.mediaType === 'audio' && post.mediaUrl && (
            <audio controls src={post.mediaUrl} style={{ width: '100%', marginTop: '1.5rem' }} />
          )}
          {post.mediaType === 'video' && post.mediaUrl && (
            <video controls src={post.mediaUrl} style={{ width: '100%', borderRadius: '16px', marginTop: '1.5rem' }} />
          )}
        </div>
      </div>

      <div className="comments-section" style={{ marginTop: '2rem' }}>
        <h3 className="section-title">Comments ({comments.length})</h3>
        
        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="Write a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="search-input"
            style={{ padding: '0.8rem 1rem', borderRadius: '20px' }}
          />
          <button type="submit" className="action-btn" style={{ background: 'var(--accent-primary)', color: 'white', padding: '0 1.25rem', borderRadius: '20px' }}>
            <Send size={18} />
          </button>
        </form>

        {comments.length > 0 ? (
          comments.map((c, i) => {
            const isOwnComment = currentUser && c.email === currentUser.email;
            return (
              <div key={c.id || i} className="comment-item" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCircle2 size={24} color="var(--text-secondary)" />
                    <h4 className="comment-author" style={{ margin: 0, fontSize: '1rem' }}>{c.email}</h4>
                  </div>
                  {isOwnComment && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEditComment(c)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Edit"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#ff7b7b', cursor: 'pointer' }} title="Delete"><Trash2 size={16}/></button>
                    </div>
                  )}
                </div>
                <p className="comment-body" style={{ fontSize: '0.95rem' }}>{c.body}</p>
              </div>
            );
          })
        ) : (
           <p style={{ color: 'var(--text-secondary)' }}>No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetailsPage;
