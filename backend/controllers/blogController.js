const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' }) // Only retrieve published blogs
            .populate('author', 'name email') // Fill in author information
            .populate('comments'); // Fill in the comment

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addBlog = async (req, res) => {
    try {
        const { title, content, tags, status } = req.body;

        const newBlog = {
            title,
            content,
            tags,
            status,
            author: req.user.id // Get the current user ID from the request
        };

        const createdBlog = await Blog.create(newBlog);

        res.status(201).json(createdBlog);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createComment = async (req, res) => {
    try {
        const { blogId, authorId, content } = req.body;

        const newComment = {
            blog: blogId,
            author: authorId,
            content: content,
        };

        await Comment.create(newComment);

        res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { getBlogs, addBlog, createComment };