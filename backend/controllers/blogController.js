const { expect } = require('chai');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' })
            .populate('author', 'name email')
            .populate({
                path: 'comments',
                options: {
                    limit: 3, // Default display of 3 latest comments
                    sort: { createdAt: -1 }
                },
                populate: {
                    path: 'author',
                    select: 'name'
                }
            }).lean();

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

const editBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        // Verify whether the user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to edit this blog.' });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('author', 'name email').populate('comments'); // Fill in the comment;

        res.status(200).json(updatedBlog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        // Verify whether the user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this blog.' });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const createBlogComment = async (req, res) => {
    try {
        const { blogId, content } = req.body;

        const newComment = {
            blog: blogId,
            author: req.user.id,
            content
        };

        const createdComment = await Comment.create(newComment);

        res.status(201).json(createdComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBlogComments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ blog: req.params.blogId })
            .populate('author', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Comment.countDocuments({ blog: req.params.blogId });

        res.json({
            comments,
            total,
            page,
            pages: Math.ceil(total / limit) // total pages of comments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Make sure that only comment authors or bloggers can delete comments.
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Comment.findByIdAndDelete(req.params.commentId);

        await Blog.findByIdAndUpdate(comment.blog, { $pull: { comments: comment._id } });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { getBlogs, addBlog, editBlog, deleteBlog, createBlogComment, getBlogComments, deleteComment };