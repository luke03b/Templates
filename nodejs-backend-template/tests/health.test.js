const request = require('supertest');

const { createApp } = require('../src/app');

describe('GET /api/health', () => {
  it('returns up status', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'UP',
      message: 'Node.js backend template is running',
    });
  });
});
