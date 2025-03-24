import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BlogList = ({ blogs, setBlogs, setEditingBlog }) => {
  const { user } = useAuth();

  const handleDelete = async (blogId) => {
    try {
      await axiosInstance.delete(`/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      alert('Failed to delete blog.');
    }
  };

  return (
    <div>
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{blog.title}</h2>
          <p>{blog.description}</p>
          <p className="text-sm text-gray-500">Deadline: {new Date(blog.deadline).toLocaleDateString()}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingBlog(blog)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(blog._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogList;
