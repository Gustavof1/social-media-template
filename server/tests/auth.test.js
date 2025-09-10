const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose =require('mongoose');
const authRoutes = require('../routes/auth');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with an existing email', async () => {
      const user = new User({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'test2@example.com',
          password: 'password456',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('password123', salt);
      const user = new User({
        username: 'loginuser',
        email: 'login@example.com',
        password,
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Invalid Credentials');
    });
  });
});
