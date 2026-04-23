const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authLoginSchema } = require('../utils/schemas');

// Rutas de Autenticación
router.post('/register', authController.register); // (Omit validation for register for brevity or add it later if needed)
router.post('/login', validate(authLoginSchema), authController.login);

module.exports = router;
