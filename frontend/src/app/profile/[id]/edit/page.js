'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function EditProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Email validation regex
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/users/${id}`);
        const user = res.data;
        setForm({
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          currentPassword: '',
          newPassword: '',
        });
      } catch (err) {
        setError('Failed to load user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(form.email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!form.currentPassword.trim()) {
      alert('You must enter your current password to update your profile.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to update your profile.');
        router.push('/login');
        return;
      }

      await axios.put(
        `http://localhost:5000/users/${id}`,
        {
          name: form.name.trim(),
          email: form.email.trim(), // Email sent but user cannot edit field
          bio: form.bio.trim() || null,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword.trim() || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Profile updated successfully.');
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));

      // Update stored user info in localStorage (using updated name and bio)
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userObj = JSON.parse(currentUser);
        userObj.name = form.name;
        userObj.bio = form.bio;
        // Do not update email if you want to prevent email edits
        localStorage.setItem('user', JSON.stringify(userObj));
      }

      setTimeout(() => {
        router.push(`/profile/${id}`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading profile for editing...</p>;
  if (error && !submitting) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div
      style={{
        maxWidth: 500,
        margin: '40px auto',
        padding: 20,
        border: '1px solid #ccc',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ color: '#0073b1', marginBottom: 20 }}>Edit Profile</h2>

      {error && submitting && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        {/* Name field */}
        <label htmlFor="name" style={{ display: 'block', marginTop: 12, fontWeight: 'bold' }}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          disabled={submitting}
          style={{ width: '100%', padding: 8, borderRadius: 4, borderColor: '#ccc' }}
        />

        {/* Email field (read-only, NOT disabled so value shows properly) */}
        <label htmlFor="email" style={{ display: 'block', marginTop: 12, fontWeight: 'bold' }}>
          Email (read-only)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          readOnly
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 4,
            borderColor: '#ccc',
            backgroundColor: '#f9f9f9',
            color: '#555',
            cursor: 'default',
          }}
        />

        {/* Bio field */}
        <label htmlFor="bio" style={{ display: 'block', marginTop: 12, fontWeight: 'bold' }}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={form.bio}
          onChange={handleChange}
          disabled={submitting}
          style={{ width: '100%', padding: 8, borderRadius: 4, borderColor: '#ccc' }}
        />

        {/* Current password (required) */}
        <label
          htmlFor="currentPassword"
          style={{ display: 'block', marginTop: 12, fontWeight: 'bold' }}
        >
          Current Password * (required to save)
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          required
          disabled={submitting}
          style={{ width: '100%', padding: 8, borderRadius: 4, borderColor: '#ccc' }}
        />

        {/* New password (optional) */}
        <label
          htmlFor="newPassword"
          style={{ display: 'block', marginTop: 12, fontWeight: 'bold' }}
        >
          New Password (optional)
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          disabled={submitting}
          style={{ width: '100%', padding: 8, borderRadius: 4, borderColor: '#ccc' }}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 20,
            width: '100%',
            padding: 12,
            backgroundColor: '#0073b1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
