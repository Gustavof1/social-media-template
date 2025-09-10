const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const profileRoutes = require('../routes/profiles');
const commentRoutes = require('../routes/comments');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');
const { setupUser } = require('./helpers');

const app = express();
app.use(express.json());
app.use('/api/profiles', profileRoutes);
app.use('/api/comments', commentRoutes);

let token;
let userId;
let profileId;

describe('Comment API', () => {
  beforeAll(async () => {
    const authRoutes = require('../routes/auth');
    app.use('/api/auth', authRoutes);
    const setup = await setupUser();
    token = setup.token;
    userId = setup.userId;

    const profile = new Profile({
      owner: userId,
      name: 'Test Profile',
      category: 'Fictional',
    });
    await profile.save();
    profileId = profile._id;
  });

  describe('POST /api/profiles/:id/comments', () => {
    it('should add a comment to a profile', async () => {
      const res = await request(app)
        .post(`/api/profiles/${profileId}/comments`)
        .set('x-auth-token', token)
        .send({ text: 'This is a test comment' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('text', 'This is a test comment');
    });
  });

  describe('GET /api/profiles/:id/comments', () => {
    it('should get all comments for a profile', async () => {
      const comment = new Comment({
        author: userId,
        profile: profileId,
        text: 'Another test comment',
      });
      await comment.save();

      const res = await request(app).get(`/api/profiles/${profileId}/comments`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('should delete a comment', async () => {
      const comment = new Comment({
        author: userId,
        profile: profileId,
        text: 'A comment to be deleted',
      });
      await comment.save();

      const res = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .set('x-auth-token', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Comment removed');
    });
  });
});
