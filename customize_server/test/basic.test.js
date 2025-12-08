import request from 'supertest';
import app from '../index.js';

describe('Basic Server Tests', () => {
  test('Server should respond to basic requests', async () => {
    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.body.message).toBe('Server is working!');
  });

  test('API info endpoint should work', async () => {
    const response = await request(app)
      .get('/api/v1/')
      .expect(200);

    expect(response.body.message).toBe('XRT Customized System API');
    expect(response.body.features).toContain('JWT Authentication');
  });

  test('Auth endpoints should exist', async () => {
    // Test that auth routes are registered
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({})
      .expect(400); // Should return validation error, not 404

    expect(response.body.status).toBe('error');
  });
});
