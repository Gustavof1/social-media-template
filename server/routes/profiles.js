const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  likeProfile,
} = require('../controllers/profileController');
const {
  addComment,
  getCommentsForProfile,
} = require('../controllers/commentController');

// @route   POST api/profiles
// @desc    Create a new profile
// @access  Private
router.post('/', auth, createProfile);

// @route   GET api/profiles
// @desc    Get all profiles
// @access  Public
router.get('/', getAllProfiles);

// @route   GET api/profiles/:id
// @desc    Get profile by ID
// @access  Public
router.get('/:id', getProfileById);

// @route   PUT api/profiles/:id
// @desc    Update a profile
// @access  Private
router.put('/:id', auth, updateProfile);

// @route   DELETE api/profiles/:id
// @desc    Delete a profile
// @access  Private
router.delete('/:id', auth, deleteProfile);

// @route   POST api/profiles/:id/like
// @desc    Like or unlike a profile
// @access  Private
router.post('/:id/like', auth, likeProfile);

// -- Comment Routes --

// @route   POST api/profiles/:id/comments
// @desc    Add a comment to a profile
// @access  Private
router.post('/:id/comments', auth, addComment);

// @route   GET api/profiles/:id/comments
// @desc    Get all comments for a profile
// @access  Public
router.get('/:id/comments', getCommentsForProfile);

module.exports = router;
