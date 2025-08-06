'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function ProfilesList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the currently logged-in user from localStorage
  const currentUser =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || 'null')
      : null;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/users');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p>Loading profiles...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <h1 style={{ color: '#0073b1', marginBottom: 20 }}>All User Profiles</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {users.map((user) => (
            <li
              key={user.id}
              style={{
                marginBottom: 10,
                padding: 12,
                background: '#fff',
                borderRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Link
                  href={`/profile/${user.id}`}
                  style={{
                    fontWeight: 600,
                    color: '#0073b1',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  {user.name}
                  {currentUser && Number(currentUser.id) === Number(user.id) ? ' (you)' : ''}
                </Link>
                <div style={{ fontSize: '0.9rem', color: '#444' }}>{user.email}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {user.bio || 'No bio provided'}
                </div>
              </div>
              <Link href={`/profile/${user.id}`}>
                <button
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#0073b1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                  aria-label={`View ${user.name}'s profile`}
                >
                  View Profile
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
