'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/auth/login', form);
      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Save user info to localStorage — ensures your app knows who's logged in
      localStorage.setItem('user', JSON.stringify(user));

      // Dispatch custom event so Navbar and others react to login state change
      window.dispatchEvent(new Event('login'));

      alert('Login successful!');
      router.push('/'); // redirect to home page
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Login failed: ${error.response.data.message}`);
      } else {
        alert('Login failed: Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ color: '#0073b1', marginBottom: 20 }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#0073b1',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </>
  );
}
