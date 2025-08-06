'use client';

import { useState, useRef } from 'react';
import axios from 'axios';

// You can install emoji-picker-react or any similar package: npm install emoji-picker-react
import dynamic from 'next/dynamic';

// Lazy load the emoji picker as it uses window/document
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(null); // file object
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const maxChars = 300;

  // Handle content change, allowing maxChars
  const handleChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setContent(e.target.value);
    }
  };

  // Handle Emoji click
  const onEmojiClick = (event, emojiObject) => {
    if (content.length + emojiObject.emoji.length <= maxChars) {
      setContent((prev) => prev + emojiObject.emoji);
    }
  };

  // Handle media selection
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation for image/video types
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please select an image or video file only.');
        return;
      }
      setMedia(file);
    }
  };

  // Remove attached media
  const removeMedia = () => {
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !media) {
      alert('Please enter some text or attach media to post.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to post.');
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for media upload together with content
      const formData = new FormData();
      formData.append('content', content.trim());
      if (media) {
        formData.append('media', media);
      }

      await axios.post('http://localhost:5000/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data',
        },
      });

      setContent('');
      removeMedia();
      setShowEmojiPicker(false);
      onPostCreated();
    } catch (error) {
      alert('Error posting. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Preview media (image or video)
  const renderMediaPreview = () => {
    if (!media) return null;

    if (media.type.startsWith('image/')) {
      return <img src={URL.createObjectURL(media)} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginTop: 10 }} />;
    }
    if (media.type.startsWith('video/')) {
      return (
        <video controls style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginTop: 10 }}>
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
          {/* Image upload button */}
          {/* <button
            type="button"
            onClick={() => fileInputRef.current.click()}
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
          </button> */}

          {/* Emoji picker button */}
          {/* <button
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
          </button> */}
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
    </form>
  );
}
