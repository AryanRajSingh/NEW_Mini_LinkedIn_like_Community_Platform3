'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from '../../components/PostCard';

export default function NewPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewPosts = async () => {
      setLoading(true);
      try {
        // Fetch posts created after lastSeenPostsTime (or all recent if none)
        const lastSeen = localStorage.getItem('lastSeenPostsTime') || '1970-01-01T00:00:00Z';
        const res = await axios.get(
          `http://localhost:5000/posts/new-posts?after=${encodeURIComponent(lastSeen)}`
        );
        setPosts(res.data);

        // Update lastSeenPostsTime on fetch
        localStorage.setItem('lastSeenPostsTime', new Date().toISOString());
      } catch (err) {
        console.error('Failed to fetch new posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewPosts();
  }, []);

  // Get logged-in user for passing to PostCard
  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null;

  if (loading) return <p>Loading new posts...</p>;
  if (posts.length === 0) return <p>No new posts since your last visit.</p>;

  return (
    <div style={{ maxWidth: 700, margin: '20px auto', padding: '0 15px' }}>
      <h1 style={{ color: '#0073b1', marginBottom: 20 }}>New Posts</h1>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUser?.id}
          onPostUpdated={() => {}}  // You can implement refresh if you want
          onPostDeleted={() => {}}  // Same here
        />
      ))}
    </div>
  );
}
