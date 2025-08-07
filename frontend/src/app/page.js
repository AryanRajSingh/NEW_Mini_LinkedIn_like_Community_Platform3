'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import PostForm from '../components/PostForm';

// Helper function to convert date string to "x mins ago", etc.
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds} sec${diffSeconds !== 1 ? 's' : ''} ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Use backend URL from .env variable or fallback to localhost
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  // Fetch posts from backend
  const fetchPosts = async () => {
  try {
    setError(null);
    const res = await axios.get(`${API_BASE}/posts`);
    setPosts(res.data);
  } catch (err) {
    console.error('Error fetching posts:', err);
    setError('Failed to load posts.');
  }
};

  // Fetch logged-in user info based on token or localStorage
  const fetchUserInfo = (token) => {
    try {
      if (!token) {
        setUser(null);
        return;
      }
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUser({ name: decoded.name || 'User', id: decoded.id || null });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchPosts();

    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        fetchUserInfo(token);
      }
    } else {
      fetchUserInfo(token);
    }
  }, []);

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '20px auto',
        padding: 20,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Greeting */}
      <div
        style={{
          borderBottom: '1px solid #ddd',
          paddingBottom: 12,
          marginBottom: 20,
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#0073b1',
        }}
      >
        {user ? (
          <>Hello, {user.name} <span role="img" aria-label="wave">👋</span></>
        ) : (
          <>Hello, User <span role="img" aria-label="wave">👋</span></>
        )}
      </div>

      {/* Create Post Section */}
      <section
        style={{
          marginBottom: 30,
          padding: 15,
          border: '1px solid #ccc',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <h2 style={{ fontWeight: '600', marginBottom: 10, color: '#0073b1' }}>🔽 Create Post:</h2>
        {isLoggedIn ? (
          <PostForm onPostCreated={fetchPosts} />
        ) : (
          <p>Please <Link href="/login" style={{ color: '#0073b1' }}>log in</Link> to create a post.</p>
        )}
      </section>

      {/* Posts Feed */}
      <section>
        <h2
          style={{
            borderBottom: '1px solid #ddd',
            paddingBottom: 6,
            marginBottom: 16,
            fontWeight: '600',
            color: '#0073b1',
            fontSize: '1.1rem',
          }}
        >
          📢 Recent Posts:
        </h2>

        {/* Show error if fetch failed */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Show no posts message if none */}
        {!error && posts.length === 0 && <p>No posts yet.</p>}

        {/* Render posts */}
        {!error && posts.length > 0 && posts.map((post) => (
          <div
            key={post.id}
            style={{
              marginBottom: 24,
              paddingBottom: 10,
              borderBottom: '1px solid #eee',
              background: '#fff',
              borderRadius: 6,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              padding: 15,
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                color: '#0073b1',
                marginBottom: 6,
                fontSize: '1rem',
              }}
            >
              {post.name} - <span style={{ fontWeight: 'normal', color: '#555' }}>{timeAgo(post.created_at)}</span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: '#333' }}>
              {`"${post.content}"`}
            </div>
          </div>
        ))}
      </section>

      {/* View Profile Button */}
      <div style={{ marginTop: 30, textAlign: 'center' }}>
        {user ? (
          <Link
            href={`/profile/${user.id || ''}`}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#0073b1',
              color: '#fff',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            👤 View Profile
          </Link>
        ) : (
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#0073b1',
              color: '#fff',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Login to View Profile
          </Link>
        )}
      </div>
    </div>
  );
}
