import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import BlogForm from '../components/BlogForm';
import BlogList from '../components/BlogList';
import { useAuth } from '../context/AuthContext';

const Blogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const response = await axiosInstance.get('/api/blogs', {
//           headers: { Authorization: `Bearer ${user.token}` },
//         });
//         setBlogs(response.data);
//       } catch (error) {
//         alert('Failed to fetch blogs.');
//       }
//     };

//     fetchBlogs();
//   }, [user]);

  return (
    <div className="container mx-auto p-6">
      <BlogForm
        blogs={blogs}
        setBlogs={setBlogs}
        editingBlog={editingBlog}
        setEditingBlog={setEditingBlog}
      />
      <BlogList blogs={blogs} setBlogs={setBlogs} setEditingBlog={setEditingBlog} />
    </div>
  );
};

export default Blogs;
