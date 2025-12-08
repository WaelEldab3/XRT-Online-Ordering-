import request from 'supertest';
import mongoose from 'mongoose';
import { describe, test, beforeAll, afterAll, beforeEach, expect } from '@jest/globals';
import app from '../index.js';
import User from '../models/User.js';

describe('Auth Integration Tests', () => {
  let server;
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;
  let refreshToken;

  // Test data
  const testUserData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    role: 'client'
  };

  const adminUserData = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'super_admin'
  };

  beforeAll(async () => {
    // Start server for testing
    server = app.listen(0); // Use random port
    
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xrt_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up database
    await User.deleteMany({});
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    // Clean up users before each test
    await User.deleteMany({});
  });

  describe('User Registration', () => {
    test('Should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUserData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUserData.email);
      expect(response.body.data.user.name).toBe(testUserData.name);
      expect(response.body.data.user.role).toBe('client');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      // Check that password is not returned
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('Should register a super admin with auto-approval', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(adminUserData)
        .expect(201);

      expect(response.body.data.user.role).toBe('super_admin');
      expect(response.body.data.user.isApproved).toBe(true);
    });

    test('Should reject registration with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUserData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUserData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });

    test('Should reject registration with weak password', async () => {
      const weakPasswordData = { ...testUserData, password: '123' };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('at least 8 characters');
    });

    test('Should reject registration with invalid email', async () => {
      const invalidEmailData = { ...testUserData, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const user = new User(testUserData);
      user.isApproved = true; // Approve the user
      await user.save();
      testUser = user;
    });

    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUserData.email);

      userToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    test('Should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Incorrect email or password');
    });

    test('Should reject login for unapproved user', async () => {
      // Create unapproved user
      const unapprovedUser = new User({
        ...testUserData,
        email: 'unapproved@example.com'
      });
      await unapprovedUser.save();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'unapproved@example.com',
          password: testUserData.password
        })
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('pending approval');
    });

    test('Should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Please provide email and password');
    });
  });

  describe('Token Refresh', () => {
    beforeEach(async () => {
      // Create and login user to get tokens
      const user = new User(testUserData);
      user.isApproved = true;
      await user.save();
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });
      
      userToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    test('Should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(userToken); // Should be a new token
    });

    test('Should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid refresh token');
    });

    test('Should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({})
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('No refresh token provided');
    });
  });

  describe('Protected Routes', () => {
    beforeEach(async () => {
      // Create and login user
      const user = new User(testUserData);
      user.isApproved = true;
      await user.save();
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });
      
      userToken = loginResponse.body.accessToken;

      // Create and login admin
      const admin = new User(adminUserData);
      admin.isApproved = true;
      await admin.save();
      
      const adminLoginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminUserData.email,
          password: adminUserData.password
        });
      
      adminToken = adminLoginResponse.body.accessToken;
    });

    test('Should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUserData.email);
    });

    test('Should reject protected route without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not logged in');
    });

    test('Should reject protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    test('Should access admin route with admin token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    test('Should reject admin route with user token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('permission');
    });
  });

  describe('Password Management', () => {
    beforeEach(async () => {
      // Create and login user
      const user = new User(testUserData);
      user.isApproved = true;
      await user.save();
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });
      
      userToken = loginResponse.body.accessToken;
    });

    test('Should update password with valid current password', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: testUserData.password,
          newPassword: 'newpassword123'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.accessToken).toBeDefined(); // Should return new token
    });

    test('Should reject password update with wrong current password', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('current password is wrong');
    });

    test('Should reject password update with weak new password', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: testUserData.password,
          newPassword: '123'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('at least 8 characters');
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(async () => {
      // Create user for password reset tests
      const user = new User(testUserData);
      user.isApproved = true;
      await user.save();
    });

    test('Should initiate password reset for valid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUserData.email })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Token sent to email');
    });

    test('Should reject password reset for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('no user with that email');
    });

    test('Should reset password with valid token', async () => {
      // First, request password reset
      const forgotResponse = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUserData.email });

      // Get the reset token (in development it's returned in response)
      const resetToken = forgotResponse.body.resetToken;
      expect(resetToken).toBeDefined();

      // Reset password
      const response = await request(app)
        .patch(`/api/v1/auth/reset-password/${resetToken}`)
        .send({
          password: 'newpassword123'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.accessToken).toBeDefined();
    });

    test('Should reject password reset with invalid token', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/reset-password/invalid-token')
        .send({
          password: 'newpassword123'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('invalid or has expired');
    });
  });

  describe('User Management (Admin)', () => {
    beforeEach(async () => {
      // Create admin and regular users
      const admin = new User(adminUserData);
      admin.isApproved = true;
      await admin.save();

      const user = new User(testUserData);
      user.isApproved = true;
      await user.save();

      // Login admin
      const adminLoginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminUserData.email,
          password: adminUserData.password
        });
      
      adminToken = adminLoginResponse.body.accessToken;
      testUser = user;
    });

    test('Should approve user', async () => {
      // Create unapproved user
      const unapprovedUser = new User({
        ...testUserData,
        email: 'unapproved@example.com',
        isApproved: false
      });
      await unapprovedUser.save();

      const response = await request(app)
        .patch(`/api/v1/auth/users/${unapprovedUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.isApproved).toBe(true);
    });

    test('Should ban user', async () => {
      const response = await request(app)
        .patch(`/api/v1/auth/users/${testUser._id}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isBanned: true,
          banReason: 'Test ban'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.isBanned).toBe(true);
      expect(response.body.data.user.banReason).toBe('Test ban');
    });

    test('Should update user permissions', async () => {
      const newPermissions = ['users:read', 'content:create'];
      
      const response = await request(app)
        .patch(`/api/v1/auth/users/${testUser._id}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissions: newPermissions })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.permissions).toEqual(expect.arrayContaining(newPermissions));
    });

    test('Should get all available permissions', async () => {
      const response = await request(app)
        .get('/api/v1/auth/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.permissions).toBeDefined();
      expect(Array.isArray(response.body.data.permissions)).toBe(true);
      expect(response.body.data.permissions.length).toBeGreaterThan(0);
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // Create and login user
      const user = new User(testUserData);
      user.isApproved = true;
      await user.save();
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });
      
      userToken = loginResponse.body.accessToken;
    });

    test('Should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });
});
