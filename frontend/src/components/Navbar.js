'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [newLikeCount, setNewLikeCount] = useState(0); // Placeholder, extend backend if needed
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    checkToken();
    window.addEventListener('login', checkToken);
    window.addEventListener('logout', checkToken);

    return () => {
      window.removeEventListener('login', checkToken);
      window.removeEventListener('logout', checkToken);
    };
  }, []);

  // Periodically fetch notification counts
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotificationCounts = async () => {
      try {
        const lastSeen = localStorage.getItem('lastSeenPostsTime') || '1970-01-01T00:00:00Z';

        // Fetch new posts count
        const resPosts = await fetch(
          `http://localhost:5000/posts/new?after=${encodeURIComponent(lastSeen)}`
        );
        if (resPosts.ok) {
          const data = await resPosts.json();
          setNewPostCount(data.count || 0);
        }

        // TODO: Fetch new likes count similarly if your backend supports it

      } catch (error) {
        console.error('Failed to fetch notification counts', error);
      }
    };

    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleNotificationClick = () => {
router.push('/notifications');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastSeenPostsTime');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('logout'));
    router.push('/login');
  };

  return (
    <nav
      style={{
        backgroundColor: '#0073b1',
        padding: '10px 20px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        borderRadius: '0 0 8px 8px',
      }}
    >
      <div>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', marginRight: 15 }}>
          Home
        </Link>
        <Link href="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: 15 }}>
          Profiles
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {isLoggedIn && (
          <button
            aria-label="New post notifications"
            onClick={handleNotificationClick}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
            title="New Posts"
          >
            {/* 🔔
            {(newPostCount + newLikeCount) > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -10,
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 12,
                  textAlign: 'center',
                  lineHeight: '18px',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                {newPostCount + newLikeCount}
              </span>
            )} */}
          </button>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
            aria-label="Logout"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/register"
              style={{ color: '#fff', marginRight: 15, textDecoration: 'none' }}
            >
              Register
            </Link>
            <Link href="/login" style={{ color: '#fff', textDecoration: 'none' }}>
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
