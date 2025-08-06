'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        if (!token) {
          setError('Please login as admin');
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:5000/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deleted');
      setUsers(users.filter((u) => u.id !== userId));
    } catch {
      alert('Failed to delete user');
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Dashboard - User Management</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map((user) => (
          <li
            key={user.id}
            style={{
              padding: 12,
              borderBottom: '1px solid #ccc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              {user.name} ({user.email}) {user.role === 'admin' && '[Admin]'}
            </div>
            <button
              onClick={() => deleteUser(user.id)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
