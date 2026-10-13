/**
 * controllers/profileController.js
 * Gestión del perfil personal del usuario de ARIEL.
 */
const db = require('../config/db');

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [users] = await db.query(
            `SELECT username, email, role, full_name, birth_date, gender, 
             address_street, address_number, address_city, address_state, 
             address_zip, address_country, profession, professional_scope, language 
             FROM users WHERE id = ?`,
            [userId]
        );
        
        if (users.length === 0) {
            const e = new Error('Usuario no encontrado'); e.status = 404; throw e;
        }
        
        res.status(200).json(users[0]);
    } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            full_name, birth_date, gender,
            address_street, address_number, address_city, address_state, address_zip, address_country,
            profession, professional_scope, language
        } = req.body;
        
        const [result] = await db.query(
            `UPDATE users SET 
             full_name = ?, birth_date = ?, gender = ?,
             address_street = ?, address_number = ?, address_city = ?, address_state = ?, address_zip = ?, address_country = ?,
             profession = ?, professional_scope = ?, language = ?
             WHERE id = ?`,
            [
                full_name || null, 
                birth_date ? new Date(birth_date) : null, 
                gender || null,
                address_street || null, 
                address_number || null, 
                address_city || null, 
                address_state || null, 
                address_zip || null, 
                address_country || null,
                profession || null, 
                professional_scope || null, 
                language || 'es',
                userId
            ]
        );
        
        res.status(200).json({ message: 'Perfil actualizado exitosamente' });
    } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile };
