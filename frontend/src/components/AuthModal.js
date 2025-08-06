'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthModal({ open, onClose }) {
  const router = useRouter();

  if (!open) return null;

  // Close modal and redirect
  const handleNavigate = (url) => {
    if (onClose) onClose();
    router.push(url);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalBoxStyle}>
        <h2 style={{color:'#007381' }}>Please log in or register</h2>
        <p style={{ marginTop: 8, marginBottom: 22, color:'#007381' }}>
          You need to be logged in to use all features.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18}}>
          <button style={buttonStyle} onClick={() => handleNavigate('/login')}>
            Login
          </button>
          <button style={buttonStyle} onClick={() => handleNavigate('/register')}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline styles for simplicity
const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.35)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const modalBoxStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: 32,
  minWidth: 320,
  textAlign: 'center',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
};
const buttonStyle = {
  background: '#0073b1',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '12px 28px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 'bold',
};
