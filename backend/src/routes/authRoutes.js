const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { attachAuthIfPresent } = require('../middlewares/auth');
const { authLoginSchema, authRegisterSchema } = require('../utils/schemas');

// Rutas de Autenticación
router.post('/register', attachAuthIfPresent, validate(authRegisterSchema), authController.register);
router.post('/login', validate(authLoginSchema), authController.login);

module.exports = router;
