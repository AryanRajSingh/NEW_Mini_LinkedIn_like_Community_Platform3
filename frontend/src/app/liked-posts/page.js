'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from '../../components/PostCard';

export default function LikedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setPosts([]);
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:5000/posts/liked', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch liked posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedPosts();
  }, []);

  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  if (loading) return <p>Loading liked posts...</p>;
  if (posts.length === 0) return <p>You have not liked any posts yet.</p>;

  return (
    <div style={{ maxWidth: 700, margin: '20px auto', padding: '0 15px' }}>
      <h1 style={{ color: '#0073b1', marginBottom: 20 }}>Posts You Liked</h1>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUser?.id}
          onPostUpdated={() => {}}
          onPostDeleted={() => {}}
        />
      ))}
    </div>
  );
}
