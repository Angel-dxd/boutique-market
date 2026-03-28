// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Ajusta la ruta según tu estructura [cite: 20]
const { encrypt } = require('../utils/crypto');

const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;

        // 1. Hashear contraseña (PSyP-5)
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 2. Cifrar email opcionalmente (PSyP-4) para demostrar AES
        const encryptedEmail = encrypt(email);

        // 3. Guardar en la base de datos
        const [result] = await db.execute(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, encryptedEmail]
        );

        res.status(201).json({ message: 'Usuario registrado con éxito', id: result.insertId });
    } catch (err) {
        next(err); // Manejo global de errores como sugiere tu informe [cite: 31]
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Buscar usuario
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        const user = users[0];

        // Comparar hash (PSyP-5)
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.json({ message: 'Login correcto', user: { id: user.id, username: user.username } });
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };