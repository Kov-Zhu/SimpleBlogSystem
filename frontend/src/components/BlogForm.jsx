import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BlogForm = ({ blogs, setBlogs, editingBlog, setEditingBlog }) => {
    const { user } = useAuth(); 
    const [formData, setFormData] = useState({ title: '', content: '', tags: '', status: 'draft' });

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
        if (!user) return alert('You must be logged in to submit a blog.');

        try {
            const blogData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()), // 转换成数组
            };

            let response;
            if (editingBlog) {
                response = await axiosInstance.put(`/api/blogs/${editingBlog._id}`, blogData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBlogs(blogs.map((blog) => (blog._id === response.data._id ? response.data : blog)));
            } else {
                response = await axiosInstance.post('/api/blogs', blogData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBlogs([...blogs, response.data]);
            }

            setEditingBlog(null);
            setFormData({ title: '', content: '', tags: '', status: 'draft' });
        } catch (error) {
            alert('Failed to save blog.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
            <h1 className="text-2xl font-bold mb-4">{editingBlog ? 'Edit Blog' : 'Create Blog'}</h1>
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
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            />
            <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
            >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                {editingBlog ? 'Update Blog' : 'Create Blog'}
            </button>
        </form>
    );
};

export default BlogForm;
