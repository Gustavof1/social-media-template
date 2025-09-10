const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const profileRoutes = require('../routes/profiles');
const Profile = require('../models/Profile');
const { setupUser } = require('./helpers');

const app = express();
app.use(express.json());
app.use('/api/profiles', profileRoutes);

let token;
let userId;

describe('Profile API', () => {
  beforeAll(async () => {
    const authRoutes = require('../routes/auth');
    app.use('/api/auth', authRoutes);
    const setup = await setupUser();
    token = setup.token;
    userId = setup.userId;
  });

  describe('POST /api/profiles', () => {
    it('should create a new profile', async () => {
      const res = await request(app)
        .post('/api/profiles')
        .set('x-auth-token', token)
        .send({
          name: 'Test Profile',
          category: 'Fictional',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Test Profile');
      expect(res.body).toHaveProperty('aiSummary');
    });
  });

  describe('GET /api/profiles', () => {
    it('should get all profiles', async () => {
      const profile = new Profile({
        owner: userId,
        name: 'Test Profile 2',
        category: 'Fictional',
      });
      await profile.save();

      const res = await request(app).get('/api/profiles');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/profiles/:id', () => {
    it('should get a profile by id', async () => {
      const profile = new Profile({
        owner: userId,
        name: 'Test Profile 3',
        category: 'Fictional',
      });
      await profile.save();

      const res = await request(app).get(`/api/profiles/${profile._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Test Profile 3');
    });
  });

  describe('PUT /api/profiles/:id', () => {
    it('should update a profile', async () => {
      const profile = new Profile({
        owner: userId,
        name: 'Test Profile 4',
        category: 'Fictional',
      });
      await profile.save();

      const res = await request(app)
        .put(`/api/profiles/${profile._id}`)
        .set('x-auth-token', token)
        .send({ name: 'Updated Profile' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Updated Profile');
    });
  });

  describe('DELETE /api/profiles/:id', () => {
    it('should delete a profile', async () => {
      const profile = new Profile({
        owner: userId,
        name: 'Test Profile 5',
        category: 'Fictional',
      });
      await profile.save();

      const res = await request(app)
        .delete(`/api/profiles/${profile._id}`)
        .set('x-auth-token', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Profile removed');
    });
  });

  describe('POST /api/profiles/:id/like', () => {
    it('should like and unlike a profile', async () => {
      const profile = new Profile({
        owner: userId,
        name: 'Test Profile 6',
        category: 'Fictional',
      });
      await profile.save();

      // Like the profile
      let res = await request(app)
        .post(`/api/profiles/${profile._id}/like`)
        .set('x-auth-token', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toContain(userId.toString());

      // Unlike the profile
      res = await request(app)
        .post(`/api/profiles/${profile._id}/like`)
        .set('x-auth-token', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).not.toContain(userId.toString());
    });
  });
});
