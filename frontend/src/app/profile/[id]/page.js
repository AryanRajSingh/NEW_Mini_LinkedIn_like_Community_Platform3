'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import PostCard from '../../../components/PostCard';

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorUser, setErrorUser] = useState(null);
  const [errorPosts, setErrorPosts] = useState(null);

  // Properly read current logged-in user on client side
  const loggedInUser =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || 'null')
      : null;

  // Determine if viewing your own profile
  const isOwnProfile = loggedInUser && Number(loggedInUser.id) === Number(id);

  // Fetch user profile data
  useEffect(() => {
    async function fetchUser() {
      setLoadingUser(true);
      setErrorUser(null);
      try {
        const res = await axios.get(`http://localhost:5000/users/${id}`);
        setUser(res.data);
      } catch (err) {
        setErrorUser('Failed to load user.');
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }
    if (id) fetchUser();
  }, [id]);

  // Fetch posts by this user
  useEffect(() => {
    async function fetchPosts() {
      setLoadingPosts(true);
      setErrorPosts(null);
      try {
        const res = await axios.get(`http://localhost:5000/posts/user/${id}`);
        setPosts(res.data);
      } catch (err) {
        setErrorPosts('Failed to load posts.');
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    }
    if (id) fetchPosts();
  }, [id]);

  // Refresh posts list helper
  const refreshPosts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/posts/user/${id}`);
      setPosts(res.data);
    } catch {
      // optionally handle error
    }
  };

  // Delete profile handler (optional)
const handleDeleteProfile = async () => {
  if (!confirm('Are you sure you want to delete your profile? This action cannot be undone.')) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Clear localStorage after successful deletion
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    alert('Profile deleted.');

    // Redirect to home or login page
    router.push('/login'); // or '/'
  } catch (err) {
    alert('Failed to delete profile.');
    console.error(err);
  }
};


  // Message user button handler
  const handleMessageClick = () => {
    if (!loggedInUser) {
      alert('Please log in to message.');
      return;
    }
    if (Number(id) === Number(loggedInUser.id)) {
      alert('You cannot message yourself.');
      return;
    }
    router.push(`/chat/${id}`);
  };

  if (loadingUser) return <p>Loading user profile...</p>;
  if (errorUser) return <p style={{ color: 'red' }}>{errorUser}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div
      style={{
        maxWidth: 650,
        margin: '20px auto',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ color: '#0073b1', marginBottom: 20 }}>
        ---------------- User Profile --------------------
      </h2>

      <div
        style={{
          border: '1px solid #ddd',
          padding: 15,
          borderRadius: 6,
          marginBottom: 30,
          lineHeight: 1.6,
          color: '#444',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.5rem',
            marginBottom: 8,
          }}
        >
          <span role="img" aria-label="user" style={{ marginRight: 10 }}>
            👤
          </span>
          <strong style={{ fontSize: '1.25rem' }}>{user.name}</strong>
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 6, color: '#555' }}
        >
          <span role="img" aria-label="email" style={{ marginRight: 8 }}>
            ✉️
          </span>
          <a
            href={`mailto:${user.email}`}
            style={{ color: '#0073b1', textDecoration: 'none' }}
          >
            {user.email}
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
          <span role="img" aria-label="bio" style={{ marginRight: 8 }}>
            📝
          </span>
          <span>{user.bio || 'No bio provided.'}</span>
        </div>

        {/* Own profile action buttons */}
        {isOwnProfile && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => router.push(`/profile/${id}/edit`)}
              style={{
                marginRight: 10,
                padding: '8px 16px',
                backgroundColor: '#0073b1',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Edit Profile
            </button>
            <button
              onClick={handleDeleteProfile}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Delete Profile
            </button>
          </div>
        )}

        {/* Message button for other users */}
        {!isOwnProfile && loggedInUser && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={handleMessageClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0073b1',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              💬 Message
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          border: '1px solid #ddd',
          padding: 15,
          borderRadius: 6,
          color: '#444',
        }}
      >
        <h3
          style={{
            borderBottom: '1px solid #ccc',
            paddingBottom: 6,
            marginBottom: 16,
            fontWeight: '600',
            fontSize: '1.2rem',
          }}
        >
          🧾 Posts by {user.name}:
        </h3>

        {loadingPosts ? (
          <p>Loading posts...</p>
        ) : errorPosts ? (
          <p style={{ color: 'red' }}>{errorPosts}</p>
        ) : posts.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#666' }}>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={loggedInUser?.id}
              onPostUpdated={refreshPosts}
              onPostDeleted={refreshPosts}
            />
          ))
        )}
      </div>
    </div>
  );
}
