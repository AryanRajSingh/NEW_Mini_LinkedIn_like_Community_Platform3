'use client';

import { useState } from 'react';
import EmailInput from '../../components/EmailInput';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
  });
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Invalid email format');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.bio.trim() ||
      !form.password.trim()
    ) {
      alert('Please fill all required fields: Name, Email, Bio, Password');
      return;
    }

    if (!validateEmail(form.email)) {
      alert('Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      alert('Registration successful! Please log in.');
      window.location.href = '/login';
    } catch (error) {
      alert('Failed to connect to the server. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, fontFamily: 'Arial' }}>
      <h1 style={{ color: '#007bff', marginBottom: 20 }}>Register</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <EmailInput
          value={form.email}
          onChange={(val) => handleChange({ target: { name: 'email', value: val } })}
          error={emailError}
          disabled={loading}
        />

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="bio" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            required
            disabled={loading}
            rows={3}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            minLength={6}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.name || !form.email || !form.bio || !form.password || !!emailError}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: 4,
            border: 'none',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: 20 }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Login here
        </a>
      </p>
    </div>
  );
}
