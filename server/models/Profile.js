const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  profilePictureUrl: { type: String, default: 'default_avatar_url' },
  category: {
    type: String,
    enum: ['Human', 'Fictional', 'Object', 'Animal', 'Concept', 'Other'],
    required: true
  },
  aiSummary: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Comments will be a separate collection to avoid unbounded document growth
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);
