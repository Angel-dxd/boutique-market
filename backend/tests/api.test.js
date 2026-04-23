const request = require('supertest');
const app = require('../server');

describe('API Integration Tests', () => {
    it('GET / - Should return online status', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'Online');
    });

    it('GET /api/invalid-route - Should return 404', async () => {
        const response = await request(app).get('/api/invalid-route');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
    });

    it('POST /api/auth/login - Should fail with missing credentials', async () => {
        const response = await request(app).post('/api/auth/login').send({});
        expect(response.status).toBe(400); // Bad Request because of empty body or zod validation
        expect(response.body).toHaveProperty('success', false);
    });

    it('GET /api/products - Should return products for tenant', async () => {
        // Requires multitenant context, we test if it returns 200 at least
        const response = await request(app)
            .get('/api/products')
            .set('x-tenant-id', 'market');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data) || Array.isArray(response.body)).toBeTruthy();
    });
});
