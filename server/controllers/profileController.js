const Profile = require('../models/Profile');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Create a new profile
exports.createProfile = async (req, res) => {
  const { name, category, profilePictureUrl } = req.body;

  try {
    // Generate AI Summary if API key is available
    let aiSummary = 'AI summary could not be generated. Please provide a Gemini API Key.';
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Write a creative, one-paragraph summary for a persona named "${name}" which is a ${category}.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiSummary = response.text();
      } catch (aiError) {
        console.error('AI generation failed:', aiError.message);
        // Fail gracefully, the default summary will be used.
      }
    }

    const newProfile = new Profile({
      owner: req.user.id,
      name,
      category,
      profilePictureUrl,
      aiSummary,
    });

    const profile = await newProfile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('owner', ['username']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get profile by ID
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('owner', ['username']);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update a profile
exports.updateProfile = async (req, res) => {
  const { name, category, profilePictureUrl, aiSummary } = req.body;

  try {
    let profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    // Check if user owns the profile
    if (profile.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    profile = await Profile.findByIdAndUpdate(
      req.params.id,
      { $set: { name, category, profilePictureUrl, aiSummary } },
      { new: true }
    );

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a profile
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    // Check if user owns the profile
    if (profile.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Profile.findByIdAndDelete(req.params.id);
    // TODO: Also delete associated comments

    res.json({ msg: 'Profile removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Like or unlike a profile
exports.likeProfile = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        // Check if the profile has already been liked by this user
        if (profile.likes.some((like) => like.toString() === req.user.id)) {
            // Unlike the profile
            profile.likes = profile.likes.filter(
                (like) => like.toString() !== req.user.id
            );
        } else {
            // Like the profile
            profile.likes.push(req.user.id);
        }

        await profile.save();
        res.json(profile.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
