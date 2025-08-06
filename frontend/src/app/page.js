'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

// Helper function to format timestamps to "x mins ago", "y hours ago"
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

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/posts');
      setPosts(res.data);
    } catch {
      alert('Failed to load posts');
    }
  };

  // Fetch logged-in user info from stored token (optional enhancement)
  const fetchUserInfo = async (token) => {
    // Since user data is returned on login API, here we assume saved info in localStorage
    // If you store user info in localStorage, retrieve it here; else decode token or add API call.
    // For simplicity, let's decode token manually to get name (or you can store user info separately on login)
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    if (payload) {
      // Here just set a placeholder name (you can improve to fetch user details from backend)
      setUser({ name: `User` }); // fallback placeholder
      // Better approach: store user info on login and get from localStorage
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchPosts();

    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Also retrieve user info (stored or decoded token)
    // For example, if user info is stored as JSON string in localStorage:
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // fallback: you can fetch or decode token if needed
      fetchUserInfo(token);
    }
  }, []);

  // Render Greeting + Create Post form + Posts feed + View Profile button
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

      {/* Recent Posts */}
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
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
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
                "{post.content}"
              </div>
            </div>
          ))
        )}
      </section>

      {/* View Profile Button */}
      <div style={{ marginTop: 30, textAlign: 'center' }}>
        {user ? (
          <Link
            href={`/profile/${user.id || ''}`} // user ID needed here, fallback to empty string
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
