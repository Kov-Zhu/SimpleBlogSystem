import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const BlogList = ({ blogs, setBlogs, setEditingBlog }) => {
  const { user } = useAuth();

  const handleDelete = async (id) => {
    if (!user) return alert('You must be logged in to delete a blog.');

    try {
      await axiosInstance.delete(`/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBlogs(blogs.filter(blog => blog._id !== id));
      alert('Blog deleted successfully.');
    } catch (error) {
      alert('Failed to delete blog.');
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Blog List</h2>
      {blogs.length > 0 ? (
        blogs.map(blog => (
          <div key={blog._id} className="border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold">{blog.title}</h3>
            <p className="text-gray-600">{blog.content}</p>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={() => setEditingBlog(blog)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-4 py-1 rounded"
                onClick={() => handleDelete(blog._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No blogs found.</p>
      )}
    </div>
  );
};

export default BlogList;
