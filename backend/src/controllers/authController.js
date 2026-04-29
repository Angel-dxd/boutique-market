// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Ajusta la ruta según tu estructura [cite: 20]
const { encrypt } = require('../utils/crypto');

const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const tenant = req.headers['x-tenant-id'] === 'santi' ? 'santi' : 'market';

        // Registration policy:
        // - If ALLOW_PUBLIC_REGISTER=true, keep open (dev/bootstrap convenience).
        // - Otherwise only allow bootstrap (0 users) or authenticated users of same tenant.
        const allowPublicRegister = process.env.ALLOW_PUBLIC_REGISTER === 'true';
        if (!allowPublicRegister) {
            const [countRows] = await db.query('SELECT COUNT(*) AS total FROM users');
            const totalUsers = Number(countRows?.[0]?.total || 0);
            const isBootstrap = totalUsers === 0;
            const sameTenantUser = req.user && req.user.tenant === tenant;

            if (!isBootstrap && !sameTenantUser) {
                return res.status(403).json({
                    success: false,
                    errors: ['Registro deshabilitado: requiere sesión válida del mismo tenant.']
                });
            }
        }

        // 1. Hashear contraseña (PSyP-5)
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 2. Cifrar email opcionalmente (PSyP-4) para demostrar AES
        const encryptedEmail = encrypt(email);

        // 3. Guardar en la base de datos
        const [result] = await db.execute(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, encryptedEmail]
        );

        res.status(201).json({ success: true, message: 'Usuario registrado con éxito', id: result.insertId });
    } catch (err) {
        next(err); // Manejo global de errores como sugiere tu informe [cite: 31]
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Buscar usuario
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ success: false, errors: ['Credenciales inválidas'] });

        const user = users[0];

        // Comparar hash (PSyP-5)
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const tenant = req.headers['x-tenant-id'] === 'santi' ? 'santi' : 'market';
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                return res.status(500).json({ success: false, errors: ['JWT_SECRET no configurado en el servidor.'] });
            }

            const token = jwt.sign(
                {
                    sub: user.id,
                    username: user.username,
                    tenant
                },
                secret,
                { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
            );

            res.json({
                success: true,
                message: 'Login correcto',
                token,
                user: { id: user.id, username: user.username, tenant }
            });
        } else {
            res.status(401).json({ success: false, errors: ['Credenciales inválidas'] });
        }
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };