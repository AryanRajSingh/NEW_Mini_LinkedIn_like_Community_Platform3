'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MessagesList({ otherUserId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, [otherUserId]);

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: 12, borderRadius: 4 }}>
      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        messages.map(msg => (
          <div
            key={msg.id}
            style={{
              marginBottom: 8,
              textAlign: msg.sender_id === currentUserId ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 12,
                backgroundColor: msg.sender_id === currentUserId ? '#0a66c2' : '#e1e9f0',
                color: msg.sender_id === currentUserId ? 'white' : 'black',
                maxWidth: '70%',
              }}
            >
              {msg.content}
            </div>
            <div style={{ fontSize: 10, color: '#666' }}>
              {new Date(msg.created_at).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
