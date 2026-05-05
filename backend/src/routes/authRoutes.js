/**
 * routes/authRoutes.js
 * Definición de rutas para el sistema de autenticación y registro.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { attachAuthIfPresent } = require('../middlewares/auth');
const { authLoginSchema, authRegisterSchema } = require('../utils/schemas');

// Registro de usuario (requiere validación de esquema y adjunta auth si existe para multitenant)
router.post('/register', attachAuthIfPresent, validate(authRegisterSchema), authController.register);

// Inicio de sesión (valida credenciales)
router.post('/login', validate(authLoginSchema), authController.login);

module.exports = router;
