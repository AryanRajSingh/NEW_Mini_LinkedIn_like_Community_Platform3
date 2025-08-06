'use client';

import { useState } from 'react';
import axios from 'axios';

export default function MessageForm({ receiverId, onMessageSent }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (message.trim() === '') {
      alert("Please enter a message");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to send messages");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/messages',
        { receiverId, content: message.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('');
      if (onMessageSent) onMessageSent();
    } catch (err) {
      alert("Failed to send message");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sendMessage} style={{ marginTop: 16 }}>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        disabled={loading}
        style={{ width: '100%', padding: 8, borderRadius: 4, resize: "vertical" }}
      />
      <button type="submit" disabled={loading || message.trim() === ''} style={{ marginTop: 8, padding: '8px 16px' }}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
