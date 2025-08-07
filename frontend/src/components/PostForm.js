'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

// Lazy-load emoji picker for SSR compatibility
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(null); // file object
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const maxChars = 300;

  // Use backend URL from .env or fallback to localhost
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  // Handle content input change
  const handleChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setContent(e.target.value);
    }
  };

  // Handle emoji selected
  const onEmojiClick = (emojiObject) => {
    const emoji = emojiObject?.emoji || '';
    if (content.length + emoji.length <= maxChars) {
      setContent((prev) => prev + emoji);
    }
  };

  // Handle media file input change
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError('Please select an image or video file only.');
        return;
      }
      setMedia(file);
      setError(null);
    }
  };

  // Remove attached media
  const removeMedia = () => {
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!content.trim() && !media) {
      setError('Please enter some text or attach media to post.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to post.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (media) {
        formData.append('media', media);
      }

      await axios.post(`${API_BASE}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let browser set Content-Type for multipart formData
        },
      });

      setContent('');
      removeMedia();
      setShowEmojiPicker(false);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError('Error posting. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Media preview (image or video)
  const renderMediaPreview = () => {
    if (!media) return null;

    if (media.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(media)}
          alt="preview"
          style={{
            maxWidth: '100%',
            maxHeight: 200,
            borderRadius: 6,
            marginTop: 10,
          }}
        />
      );
    }
    if (media.type.startsWith('video/')) {
      return (
        <video
          controls
          style={{
            maxWidth: '100%',
            maxHeight: 200,
            borderRadius: 6,
            marginTop: 10,
          }}
        >
          <source src={URL.createObjectURL(media)} type={media.type} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20, position: 'relative' }}>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={handleChange}
        rows={3}
        maxLength={maxChars}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 6,
          borderColor: '#ccc',
          resize: 'vertical',
          fontSize: '1rem',
        }}
        disabled={loading}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
          marginBottom: 6,
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          color: content.length > maxChars ? 'red' : '#666',
        }}
      >
        <div>{content.length} / {maxChars}</div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Image/Video upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={loading}
            title="Attach Image or Video"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              color: '#0073b1',
            }}
            aria-label="Attach Image or Video"
          >
            📎
          </button>

          {/* Emoji picker toggle button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={loading}
            title="Add Emoji"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              color: '#0073b1',
            }}
            aria-label="Add Emoji"
          >
            😊
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaChange}
        style={{ display: 'none' }}
        disabled={loading}
      />

      {renderMediaPreview()}

      {media && (
        <button
          type="button"
          onClick={removeMedia}
          style={{
            marginTop: 6,
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          disabled={loading}
        >
          Remove media
        </button>
      )}

      {showEmojiPicker && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1000,
            bottom: '50px',
            right: 0,
          }}
        >
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (!content.trim() && !media)}
        style={{
          marginTop: 8,
          backgroundColor: '#0073b1',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 20px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem',
        }}
      >
        {loading ? 'Posting...' : 'Post'}
      </button>

      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </form>
  );
}
