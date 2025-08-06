'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current logged-in user from localStorage
  const loggedInUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null;

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/profile');
        let allUsers = res.data || [];

        if (loggedInUser) {
          allUsers.sort((a, b) => {
            if (a.id === loggedInUser.id) return -1;
            if (b.id === loggedInUser.id) return 1;
            return a.name.localeCompare(b.name);
          });
        }

        

        setUsers(allUsers);
      } catch (err) {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [loggedInUser]);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!users.length) return <p>No users found.</p>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 15px' }}>
      <h1 style={{ color: '#0073b7', marginBottom: 20 }}>All Profiles</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map(user => (
          <li 
            key={user.id}
            style={{
              backgroundColor: user.id === loggedInUser?.id ? '#e6f7ff' : 'white',
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: 6,
              marginBottom: 10,
              fontWeight: user.id === loggedInUser?.id ? 'bold' : 'normal',
            }}
          >
            <Link href={`/profile/${user.id}`} style={{ textDecoration: 'none', color: '#0073b7' }}>
              {user.id === loggedInUser?.id ? `${user.name} (you)` : user.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
