import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BlogForm = ({ blogs, setBlogs, editingBlog, setEditingBlog }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        status: 'draft',
    });

    useEffect(() => {
        if (editingBlog) {
            setFormData({
                title: editingBlog.title,
                content: editingBlog.content,
                tags: editingBlog.tags.join(', '),
                status: editingBlog.status,
            });
        } else {
            setFormData({ title: '', content: '', tags: '', status: 'draft' });
        }
    }, [editingBlog]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const blogData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()),
            };

            if (editingBlog) {
                const response = await axiosInstance.put(`/api/blogs/${editingBlog._id}`, blogData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBlogs(blogs.map((blog) => (blog._id === response.data._id ? response.data : blog)));
            } else {
                const response = await axiosInstance.post('/api/blogs', blogData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBlogs([...blogs, response.data]);
            }
            setEditingBlog(null);
            setFormData({ title: '', content: '', tags: '', status: 'draft' });
        } catch (error) {
            console.error('Error submitting blog:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
            <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
                required
            />
            <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
                required
            />
            <input
                type="text"
                placeholder="#tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
            </select>
            <button type="submit">{editingBlog ? 'Update Blog' : 'Create Blog'}</button>
        </form>
    );
};

export default BlogForm;
