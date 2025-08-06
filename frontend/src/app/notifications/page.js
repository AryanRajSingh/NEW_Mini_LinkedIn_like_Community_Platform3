'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationsPage() {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view notifications.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLikes(res.data.likes || []);
        setComments(res.data.comments || []);
      } catch (err) {
        setError('Failed to load notifications.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 15px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#0077b6' }}>🔔 Notifications</h1>

      <section>
        <h2>👍 Likes</h2>
        {likes.length === 0 && <p>No new likes on your posts.</p>}
        {likes.map((like) => (
          <div key={`${like.likerId}-${like.post_id}-${like.likedAt}`} style={{borderBottom: '1px solid #ddd', padding: '10px 0'}}>
            <strong>{like.likerName}</strong> liked your post:
            <blockquote style={{ fontStyle: 'italic', margin: '5px 0' }}>{like.postContent}</blockquote>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>💬 Comments</h2>
        {comments.length === 0 && <p>No new comments on your posts.</p>}
        {comments.map((comment) => (
          <div key={`${comment.commenterId}-${comment.post_id}-${comment.commentedAt}`} style={{borderBottom: '1px solid #ddd', padding: '10px 0'}}>
            <strong>{comment.commenterName}</strong> commented on your post:
            <blockquote style={{ fontStyle: 'italic', margin: '5px 0' }}>{comment.postContent}</blockquote>
            <p>"{comment.commentText}"</p>
          </div>
        ))}
      </section>
    </div>
  );
}
