const Comment = require('../models/Comment');
const Profile = require('../models/Profile');

// Add a new comment to a profile
exports.addComment = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    const newComment = new Comment({
      author: req.user.id,
      profile: req.params.id,
      text: req.body.text,
      imageUrl: req.body.imageUrl, // Assuming URL is passed directly for now
    });

    const comment = await newComment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all comments for a profile
exports.getCommentsForProfile = async (req, res) => {
  try {
    const comments = await Comment.find({ profile: req.params.id }).populate('author', ['username']);
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
