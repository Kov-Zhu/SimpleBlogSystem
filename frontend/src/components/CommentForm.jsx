// components/CommentForm.jsx
import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const CommentForm = ({ blogId, onCommentAdded }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    try {
      const response = await axiosInstance.post(`/api/blogs/comments/${blogId}`, {
        blogId,
        content
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      onCommentAdded(response.data);
      setContent('');
    } catch (error) {
      console.error('Comment submission failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Leave your comment..."
        className="w-full p-2 border rounded"
        rows="3"
      />
      <button
        type="submit"
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default CommentForm;