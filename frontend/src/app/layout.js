'use client';

import './globals.css';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { useEffect, useState } from 'react';

function LayoutWithAuthModal({ children }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkAuth = () => setShowModal(!localStorage.getItem('token'));
    checkAuth();
    window.addEventListener('login', checkAuth);
    window.addEventListener('logout', checkAuth);
    return () => {
      window.removeEventListener('login', checkAuth);
      window.removeEventListener('logout', checkAuth);
    };
  }, []);

  // Modal will close as soon as user navigates away, so this is safe
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Navbar />
      <AuthModal open={showModal} onClose={handleCloseModal} />
      <main style={{ maxWidth: 720, margin: '20px auto', padding: '0 15px' }}>
        {children}
      </main>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutWithAuthModal>{children}</LayoutWithAuthModal>
      </body>
    </html>
  );
}
