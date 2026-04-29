process.env.JWT_SECRET = 'test_secret_key_for_jwt';

const request = require('supertest');
const app = require('../server');
const { createAuthToken } = require('./helpers/auth');

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

    it('GET /api/products - Should reject unauthenticated request', async () => {
        const response = await request(app)
            .get('/api/products')
            .set('x-tenant-id', 'market');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('success', false);
    });

    it('GET /api/products - Should reject tenant mismatch in token/header', async () => {
        const token = createAuthToken({ tenant: 'market' });

        const response = await request(app)
            .get('/api/products')
            .set('x-tenant-id', 'santi')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
    });

    it('Protected routes - Should reject unauthenticated access across modules', async () => {
        const protectedRoutes = [
            '/api/products',
            '/api/clients',
            '/api/finance',
            '/api/invoices',
            '/api/providers',
            '/api/gallery',
            '/api/calendar/appointments',
            '/api/dashboard/stats'
        ];

        for (const route of protectedRoutes) {
            const response = await request(app)
                .get(route)
                .set('x-tenant-id', 'market');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        }
    });

    it('Protected routes - Should reject tenant mismatch across modules', async () => {
        const token = createAuthToken({ tenant: 'market' });
        const protectedRoutes = [
            '/api/products',
            '/api/clients',
            '/api/finance',
            '/api/invoices',
            '/api/providers',
            '/api/gallery',
            '/api/calendar/appointments',
            '/api/dashboard/stats'
        ];

        for (const route of protectedRoutes) {
            const response = await request(app)
                .get(route)
                .set('x-tenant-id', 'santi')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        }
    });
});
