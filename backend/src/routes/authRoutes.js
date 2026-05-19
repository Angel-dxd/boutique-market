/**
 * routes/authRoutes.js
 * Definición de rutas para el sistema de autenticación y registro.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { attachAuthIfPresent, requireAuth } = require('../middlewares/auth');
const { authLoginSchema, authRegisterSchema, changePasswordSchema } = require('../utils/schemas');

/**
 * @route POST /api/auth/register
 * @description Registra un nuevo usuario en el sistema.
 * @access Public/Private (dependiendo de ALLOW_PUBLIC_REGISTER y tenant)
 * @middleware attachAuthIfPresent - Extrae el JWT si existe (para validación multitenant).
 * @middleware validate(authRegisterSchema) - Valida la estructura del body (username, password, email).
 * @controller authController.register
 */
router.post('/register', attachAuthIfPresent, validate(authRegisterSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @description Inicia sesión y devuelve un token JWT.
 * @access Public
 * @middleware validate(authLoginSchema) - Valida la estructura del body (username, password).
 * @controller authController.login
 */
router.post('/login', validate(authLoginSchema), authController.login);

/**
 * @route PUT /api/auth/change-password
 * @description Cambia la contraseña del usuario actualmente autenticado.
 * @access Private
 * @middleware requireAuth - Valida que exista una sesión activa (JWT).
 * @middleware validate(changePasswordSchema) - Valida los campos currentPassword y newPassword.
 * @controller authController.changePassword
 */
router.put('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);

module.exports = router;

