import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import BlogForm from '../components/BlogForm';
import BlogList from '../components/BlogList';
import { useAuth } from '../context/AuthContext';

const Blogs = () => {
    const { user } = useAuth(); // 获取用户信息
    const [blogs, setBlogs] = useState([]);
    const [editingBlog, setEditingBlog] = useState(null);

    // 获取博客数据
    useEffect(() => {
        const fetchBlogs = async () => {
            if (!user) return; // 用户未登录时不执行

            try {
                const response = await axiosInstance.get('/api/blogs', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                console.log('Fetched Blogs:', response.data);
                setBlogs(response.data);
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
            }
        };

        fetchBlogs();
    }, [user]); // 依赖 user，确保登录后才请求数据

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
                    <BlogList blogs={blogs} setBlogs={setBlogs} setEditingBlog={setEditingBlog} />
                </>
            ) : (
                <p className="text-center text-red-500">Please log in to manage blogs.</p>
            )}
        </div>
    );
};

export default Blogs;
