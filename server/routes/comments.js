const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { deleteComment } = require('../controllers/commentController');

// @route   DELETE api/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:commentId', auth, deleteComment);

module.exports = router;
