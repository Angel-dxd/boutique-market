/**
 * api.test.js
 * Pruebas de integración para la API REST.
 * Valida la autenticación, protección de rutas y manejo de inquilinos (multitenancy).
 */
process.env.JWT_SECRET = 'test_secret_key_for_jwt';


const request = require('supertest');
const app = require('../server');
const { createAuthToken } = require('./helpers/auth');

describe('Pruebas de Integración de la API (API Integration Tests)', () => {

    it('GET / - Debería retornar el estado "Online" del servidor', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'Online');
    });

    it('GET /api/invalid-route - Debería retornar un error 404 para rutas inexistentes', async () => {
        const response = await request(app).get('/api/invalid-route');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
    });

    it('POST /api/auth/login - Debería fallar si faltan credenciales', async () => {
        const response = await request(app).post('/api/auth/login').send({});
        expect(response.status).toBe(400); // Bad Request because of empty body or zod validation
        expect(response.body).toHaveProperty('success', false);
    });

    it('GET /api/products - Debería rechazar peticiones sin autenticación (sin token)', async () => {
        const response = await request(app)
            .get('/api/products')
            .set('x-tenant-id', 'market');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('success', false);
    });

    it('GET /api/products - Debería rechazar si el tenant del token no coincide con el header', async () => {
        const token = createAuthToken({ tenant: 'market' });

        const response = await request(app)
            .get('/api/products')
            .set('x-tenant-id', 'santi')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
    });

    it('Rutas protegidas - Deberían rechazar acceso sin autenticación en todos los módulos', async () => {
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

    it('Rutas protegidas - Deberían rechazar inconsistencia de inquilinos en todos los módulos', async () => {
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
