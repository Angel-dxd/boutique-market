/**
 * authController.test.js
 * Pruebas unitarias para las políticas de registro y autenticación.
 * Verifica la lógica de seguridad para la creación de usuarios y el contexto multitenant.
 */
const db = require('../src/config/db');

const bcrypt = require('bcryptjs');
const { encrypt } = require('../src/utils/crypto');
const { register, changePassword } = require('../src/controllers/authController');

jest.mock('../src/config/db', () => ({
    query: jest.fn(),
    execute: jest.fn()
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn()
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

describe('authController.changePassword policy (Cambio de Contraseña)', () => {
    const createRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('cambia la contraseña con éxito si la contraseña actual es válida', async () => {
        db.execute.mockResolvedValueOnce([[{ id: 1, username: 'santi', password: 'old_hashed_password' }]]); // select
        db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); // update
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue('new_hashed_password');

        const req = {
            body: { currentPassword: 'password123', newPassword: 'newpassword456' },
            user: { id: 1, username: 'santi', tenant: 'santi' }
        };
        const res = createRes();
        const next = jest.fn();

        await changePassword(req, res, next);

        expect(db.execute).toHaveBeenNthCalledWith(1, 'SELECT * FROM users WHERE id = ?', [1]);
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'old_hashed_password');
        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword456', 10);
        expect(db.execute).toHaveBeenNthCalledWith(2, 'UPDATE users SET password = ? WHERE id = ?', ['new_hashed_password', 1]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Contraseña actualizada con éxito' });
        expect(next).not.toHaveBeenCalled();
    });

    it('falla si la contraseña actual es incorrecta', async () => {
        db.execute.mockResolvedValueOnce([[{ id: 1, username: 'santi', password: 'old_hashed_password' }]]); // select
        bcrypt.compare.mockResolvedValue(false);

        const req = {
            body: { currentPassword: 'wrongpassword', newPassword: 'newpassword456' },
            user: { id: 1, username: 'santi', tenant: 'santi' }
        };
        const res = createRes();
        const next = jest.fn();

        await changePassword(req, res, next);

        expect(db.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1]);
        expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'old_hashed_password');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ success: false, errors: ['La contraseña actual es incorrecta.'] });
        expect(db.execute).toHaveBeenCalledTimes(1); // No update executed
        expect(next).not.toHaveBeenCalled();
    });

    it('falla si el usuario no es encontrado', async () => {
        db.execute.mockResolvedValueOnce([[]]); // empty select

        const req = {
            body: { currentPassword: 'password123', newPassword: 'newpassword456' },
            user: { id: 999, username: 'ghost', tenant: 'santi' }
        };
        const res = createRes();
        const next = jest.fn();

        await changePassword(req, res, next);

        expect(db.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [999]);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, errors: ['Usuario no encontrado'] });
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
});

