/**
 * controllers/authController.js
 * Sistema de Autenticación y Registro.
 * Implementa hashing de contraseñas con bcrypt y cifrado de datos sensibles con AES.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Ajusta la ruta según tu estructura [cite: 20]
const { encrypt } = require('../utils/crypto');

const SALT_ROUNDS = 10;

/**
 * Registra un nuevo usuario en el sistema.
 * 
 * Si `ALLOW_PUBLIC_REGISTER=true` en el entorno, se permite el registro abierto.
 * De lo contrario, solo se permite registrar al primer usuario (bootstrap) o 
 * si la solicitud proviene de un usuario autenticado del mismo tenant.
 *
 * @async
 * @function register
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.username - Nombre de usuario.
 * @param {string} req.body.password - Contraseña en texto plano.
 * @param {string} req.body.email - Correo electrónico del usuario.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware de errores.
 * @returns {Promise<void>} Retorna un JSON con el estado de la operación y el ID del usuario creado.
 */
const register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const tenant = req.headers['x-tenant-id'] === 'santi' ? 'santi' : 'market';

        // Política de Registro:
        // - Si ALLOW_PUBLIC_REGISTER=true, registro abierto (desarrollo).
        // - De lo contrario, solo permite el bootstrap (0 usuarios) o usuarios autenticados del mismo tenant.
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

        // 1. Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 2. Cifrar email (AES-256)
        const encryptedEmail = encrypt(email);

        // 3. Guardar en base de datos
        const [result] = await db.execute(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, encryptedEmail]
        );

        res.status(201).json({ success: true, message: 'Usuario registrado con éxito', id: result.insertId });
    } catch (err) {
        next(err);
    }
};

/**
 * Inicia sesión y genera un token JWT para el usuario.
 *
 * Busca el usuario en la base de datos, verifica que la contraseña coincida con el hash,
 * y genera un JSON Web Token (JWT) con una validez configurada (por defecto 12h).
 *
 * @async
 * @function login
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.username - Nombre de usuario.
 * @param {string} req.body.password - Contraseña en texto plano.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware de errores.
 * @returns {Promise<void>} Retorna un JSON con el token JWT y los datos básicos del usuario.
 */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Buscar usuario
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ success: false, errors: ['Credenciales inválidas'] });

        const user = users[0];

        // Comparar hash
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