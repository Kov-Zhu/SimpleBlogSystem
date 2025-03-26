import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import BlogForm from '../components/BlogForm';
import BlogList from '../components/BlogList';
import { useAuth } from '../context/AuthContext';

const Blogs = () => {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [editingBlog, setEditingBlog] = useState(null);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axiosInstance.get('/api/blogs');
                const blogsData = response.data;

                // Initialize pagination state
                const initialPagination = {};
                blogsData.forEach(blog => {
                    initialPagination[blog._id] = {
                        page: 1,
                        // According to the default, load 3 to determine if there are more.
                        hasMore: blog.comments?.length >= 3
                    };
                });

                setPagination(initialPagination);
                setBlogs(blogsData);
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
            }
        };

        fetchBlogs();

    }, [user]);

    return (
        <div className="container mx-auto p-6">
            {user ? (
                <>
                    <BlogForm
                        blogs={blogs}
                        setBlogs={setBlogs}
                        editingBlog={editingBlog}
                        setEditingBlog={setEditingBlog}
                    />
                    <BlogList blogs={blogs} setBlogs={setBlogs} pagination={pagination} setPagination={setPagination} />
                </>
            ) : (
                <>
                    <h1> Login to create a blog. </h1>
                    <BlogList blogs={blogs} setBlogs={setBlogs} pagination={pagination} setPagination={setPagination} />
                </>
            )}
        </div>
    );
};

export default Blogs;
