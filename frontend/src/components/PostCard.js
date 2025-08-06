"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function PostCard({
  post,
  currentUserId,
  onPostUpdated,
  onPostDeleted,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [userLiked, setUserLiked] = useState(false);

  const [comments, setComments] = useState([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");

  const maxCommentLength = 300;

  const canEdit = currentUserId === post.user_id;

  // Initialize comments and like status
  useEffect(() => {
    // Fetch comments
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/comments/post/${post.id}`
        );
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };

    // Optionally, fetch if the current user liked this post (implement if backend supports)
    // For now default false, can enhance by querying backend on liked posts if available
    const fetchUserLikedStatus = () => {
      setUserLiked(false);
    };

    fetchComments();
    fetchUserLikedStatus();
  }, [post.id]);

  // Handle Like/Unlike
const toggleLike = async () => {
  if (!currentUserId) {
    alert("Please log in to like posts.");
    return;
  }

  setLoading(true);
  const token = localStorage.getItem("token");

  try {
    if (!userLiked) {
      await axios.post(
        `http://localhost:5000/posts/${post.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserLiked(true);
      setLikeCount((count) => count + 1);
    } else {
      await axios.post(
        `http://localhost:5000/posts/${post.id}/unlike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserLiked(false);
      setLikeCount((count) => Math.max(0, count - 1));
    }
    if (onPostUpdated) onPostUpdated();
  } catch (error) {
    if (
      error.response?.status === 400 &&
      error.response?.data?.message === "Post already liked"
    ) {
      // This means the backend aborted a repeated like, so just sync frontend:
      alert("You already liked this post.");
      setUserLiked(true);
    } else if (
      error.response?.status === 400 &&
      error.response?.data?.message === "You have not liked this post"
    ) {
      alert("You have already unliked this post.");
      setUserLiked(false);
    } else {
      alert("Failed to update like status. Please try again.");
    }
    console.error(error);
  } finally {
    setLoading(false);
  }
};


  // Handle adding a comment
  const addComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUserId) {
      alert("You need to log in to comment.");
      return;
    }
    if (newComment.length > maxCommentLength) {
      alert(`Comment cannot exceed ${maxCommentLength} characters.`);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `http://localhost:5000/comments/post/${post.id}`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      setShowCommentBox(false);

      if (onPostUpdated) onPostUpdated();

      // Refresh comments after posting new comment
      const res = await axios.get(
        `http://localhost:5000/comments/post/${post.id}`
      );
      setComments(res.data);
    } catch (error) {
      alert("Failed to post comment. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle post update
  const handleUpdate = async () => {
    if (!content.trim()) {
      alert("Post content cannot be empty.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/posts/${post.id}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      alert("Failed to update post. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle post deletion
 // Assuming props: post, currentUserId, onPostDeleted

const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this post?")) return;

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Post deleted successfully.");
    if (onPostDeleted) {
      onPostDeleted();  // Refresh posts parent state after deletion
    }
  } catch (error) {
    alert("Failed to delete the post. Please try again.");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Inside JSX render (only show if owner)
// Example snippet inside PostCard JSX:
{post.user_id === currentUserId && (
  <>
    <button
      onClick={() => setIsEditing(true)}
      style={{
        cursor: 'pointer',
        color: '#007b',
        background: 'none',
        border: 'none',
        fontWeight: '600',
        marginRight: 8,
      }}
    >
      Edit
    </button>
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        cursor: 'pointer',
        color: 'red',
        background: 'none',
        border: 'none',
        fontWeight: '600',
      }}
    >
      Delete
    </button>
  </>
)}



  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header: Author and timestamp */}
      <div style={{ marginBottom: 8, fontWeight: "bold", color: "#0073b1" }}>
        {post.name}{" "}
        <span style={{ marginLeft: 10, color: "#666", fontSize: "0.85rem" }}>
          {new Date(post.created_at).toLocaleString()}
        </span>
      </div>

      {/* Post content / edit mode */}
      {isEditing ? (
        <>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={300}
            placeholder="Edit your post (max 300 characters)"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              borderColor: "#ccc",
              resize: "vertical",
              fontSize: "1rem",
            }}
          />
          <div style={{ marginTop: 8 }}>
            <button
              onClick={handleUpdate}
              disabled={loading}
              style={{
                marginRight: 8,
                backgroundColor: "#0073b1",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setContent(post.content);
                setIsEditing(false);
              }}
              disabled={loading}
              style={{
                backgroundColor: "#ccc",
                color: "#333",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "1rem",
              color: "#333",
              marginBottom: 10,
            }}
          >
            {post.content}
          </div>

          {/* Interaction buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: "0.95rem",
            }}
          >
            {/* Like Button */}
<button
  onClick={toggleLike}
  disabled={!currentUserId || loading}
  style={{
    cursor: !currentUserId || loading ? "not-allowed" : "pointer",
    color: userLiked ? "red" : "#007bff",
    background: "none",
    border: "none",
    fontSize: 24,
  }}
  aria-label={userLiked ? "Unlike post" : "Like post"}
  title={userLiked ? "Click to unlike" : "Click to like"}
>
  ❤️
</button>


            <span>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>

            {/* Comment Button */}
            <button
              onClick={() => setShowCommentBox((prev) => !prev)}
              style={{
                cursor: "pointer",
                background: "none",
                border: "none",
                color: "#0073b1",
                fontSize: "1.2rem",
              }}
              aria-label="Add comment"
              title="Add comment"
            >
              💬
            </button>

            {/* Edit/Delete buttons for owners */}
            {canEdit && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    cursor: "pointer",
                    color: "#0073b1",
                    background: "none",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  style={{
                    cursor: "pointer",
                    color: "red",
                    background: "none",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Comment Input */}
          {showCommentBox && (
            <div style={{ marginTop: 10 }}>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => {
                  if (e.target.value.length <= maxCommentLength) {
                    setNewComment(e.target.value);
                  }
                }}
                placeholder="Write a comment..."
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  borderColor: "#ccc",
                  resize: "vertical",
                  fontSize: "1rem",
                }}
              />
              <div
                style={{
                  textAlign: "right",
                  fontSize: "0.85rem",
                  color: newComment.length > maxCommentLength ? "red" : "#666",
                  marginTop: 4,
                  marginBottom: 6,
                  fontFamily: "monospace",
                }}
              >
                {newComment.length} / {maxCommentLength}
              </div>
              <button
                onClick={addComment}
                disabled={loading || !newComment.trim()}
                style={{
                  backgroundColor: "#0073b1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          )}

          {/* Comment List */}
          {comments.length > 0 && (
            <div
              style={{
                marginTop: 15,
                borderTop: "1px solid #eee",
                paddingTop: 10,
              }}
            >
              <strong>Comments:</strong>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: 6,
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>{comment.user_name}</strong>: {comment.content}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
