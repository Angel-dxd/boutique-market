/**
 * authController.test.js
 * Pruebas unitarias para las políticas de registro y autenticación.
 * Verifica la lógica de seguridad para la creación de usuarios y el contexto multitenant.
 */
const db = require('../src/config/db');

const bcrypt = require('bcrypt');
const { encrypt } = require('../src/utils/crypto');
const { register } = require('../src/controllers/authController');

jest.mock('../src/config/db', () => ({
    query: jest.fn(),
    execute: jest.fn()
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn()
}));

jest.mock('../src/utils/crypto', () => ({
    encrypt: jest.fn()
}));

describe('authController.register policy (Política de Registro)', () => {
    const createRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ALLOW_PUBLIC_REGISTER = 'false';
        bcrypt.hash.mockResolvedValue('hashed_password');
        encrypt.mockReturnValue('encrypted_email');
        db.execute.mockResolvedValue([{ insertId: 99 }]);
    });

    it('rechaza el registro sin autenticación cuando el bootstrap (inicio) está cerrado', async () => {
        db.query.mockResolvedValue([[{ total: 3 }]]);
        const req = {
            body: { username: 'demo', password: '123456', email: 'demo@example.com' },
            headers: { 'x-tenant-id': 'market' }
        };
        const res = createRes();
        const next = jest.fn();

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            errors: ['Registro deshabilitado: requiere sesión válida del mismo tenant.']
        });
        expect(db.execute).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('permite el registro inicial (bootstrap) cuando hay cero usuarios en el sistema', async () => {
        db.query.mockResolvedValue([[{ total: 0 }]]);
        const req = {
            body: { username: 'first-user', password: '123456', email: 'first@example.com' },
            headers: { 'x-tenant-id': 'market' }
        };
        const res = createRes();
        const next = jest.fn();

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Usuario registrado con éxito',
            id: 99
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('permite el registro si un usuario autenticado pertenece al mismo tenant (inquilino)', async () => {
        db.query.mockResolvedValue([[{ total: 5 }]]);
        const req = {
            body: { username: 'tenant-user', password: '123456', email: 'tenant@example.com' },
            headers: { 'x-tenant-id': 'santi' },
            user: { id: 1, username: 'admin', tenant: 'santi' }
        };
        const res = createRes();
        const next = jest.fn();

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Usuario registrado con éxito',
            id: 99
        });
        expect(next).not.toHaveBeenCalled();
    });
});
