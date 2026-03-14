import React, { useState, useEffect } from 'react';
import { fetchCommentsByPostId } from '../services/api';

const CommentPreview = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadComments = async () => {
      try {
        const data = await fetchCommentsByPostId(postId);
        if (isMounted) setComments(data.slice(0, 2));
      } catch (err) {
        console.error("Failed to load comments");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadComments();
    
    return () => { isMounted = false; };
  }, [postId]);

  if (loading) return <div className="comment-body" style={{marginTop: '1rem'}}>Loading comments...</div>;
  if (!comments.length) return null;

  return (
    <div className="comments-section">
      <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Recent Comments</p>
      {comments.map(c => (
        <div key={c.id} className="comment-item">
          <h5 className="comment-author">{c.email.split('@')[0]}</h5>
          <p className="comment-body">{c.body.substring(0, 80)}...</p>
        </div>
      ))}
    </div>
  );
};

export default CommentPreview;
