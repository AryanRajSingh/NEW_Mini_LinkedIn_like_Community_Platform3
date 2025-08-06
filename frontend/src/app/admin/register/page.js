'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminRegister() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/adminAuth/register', form);
      alert('Admin registered successfully');
      router.push('/admin/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>Admin Registration</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Name</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: 16, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: 16, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: 24, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0073b1',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
