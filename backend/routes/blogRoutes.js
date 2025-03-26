const express = require('express');
const { addBlog, getBlogs, editBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Add Blog (login required)
router.post('/', protect, addBlog);

// Get the blog (no login required)
router.get('/', getBlogs);

router.put('/:id', protect, editBlog);

module.exports = router;
