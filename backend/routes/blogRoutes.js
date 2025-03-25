const express = require('express');
const { addBlog, getBlogs } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Add Blog (login required)
router.post('/', protect, addBlog);

// Get the blog (no login required)
router.get('/', getBlogs);

module.exports = router;
