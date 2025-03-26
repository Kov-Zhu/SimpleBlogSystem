const express = require('express');
const { addBlog, getBlogs, editBlog, deleteBlog, getBlogComments, createBlogComment } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const { route } = require('./authRoutes');
const router = express.Router();

// Add Blog (login required)
router.post('/', protect, addBlog);

// Get the blog (no login required)
router.get('/', getBlogs);

// Edit Blog (login required)
router.put('/:id', protect, editBlog);

// Delete Blog (login required)
router.delete('/:id', protect, deleteBlog);

// Get Blog Comments
router.get('/:blogId/comments', getBlogComments);

// Create Blog Comments
router.post('/:blogId/comments', protect, createBlogComment);

module.exports = router;
