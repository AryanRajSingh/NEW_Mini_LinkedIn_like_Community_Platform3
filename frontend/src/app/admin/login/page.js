'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/adminAuth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Logged in successfully');
      router.push('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: 8, marginBottom: 16, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: 8, marginBottom: 24, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#0073b1',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
