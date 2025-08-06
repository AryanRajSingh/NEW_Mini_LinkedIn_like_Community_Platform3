'use client';

import { useState } from 'react';
import MessagesList from '../../../components/MessagesList';
import MessageForm from '../../../components/MessageForm';

export default function ChatPage({ params }) {
  // params.otherUserId from route segment
  const otherUserId = params.otherUserId;

  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null;

  const [refreshKey, setRefreshKey] = useState(0);

  const refreshMessages = () => setRefreshKey((prev) => prev + 1);

  if (!currentUser) return <p>Please log in to view the chat.</p>;

  if (Number(otherUserId) === Number(currentUser.id))
    return <p>You cannot chat with yourself.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 16, fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: 20, color: '#0073b1' }}>Chat with User {otherUserId}</h2>

      <MessagesList
        key={refreshKey}
        otherUserId={otherUserId}
        currentUserId={currentUser.id}
      />

      <MessageForm receiverId={otherUserId} onMessageSent={refreshMessages} />
    </div>
  );
}
