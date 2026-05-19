/**
 * middlewares/rateLimiter.js
 * Limitadores de tasa (Rate Limiting) para proteger la API contra ataques de fuerza bruta
 * y abuso de recursos. Implementado con express-rate-limit.
 *
 * Limitadores disponibles:
 *  - authLimiter      → rutas de autenticación (/api/auth/login, /api/auth/register)
 *  - generalLimiter   → resto de la API (protección general)
 */

const rateLimit = require('express-rate-limit');

/**
 * Generador de respuesta de error estándar para rate limiting.
 * Mantiene el formato { success, errors } consistente con el resto de la API.
 */
const rateLimitHandler = (req, res) => {
    res.status(429).json({
        success: false,
        errors: ['Demasiadas peticiones desde esta IP. Espera unos minutos e inténtalo de nuevo.']
    });
};

/**
 * Limita los intentos en rutas de autenticación.
 * Configuración conservadora: 10 intentos por IP en 15 minutos.
 * Mitiga ataques de fuerza bruta al login.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,     // Incluye cabeceras RateLimit-* estándar (RFC 6585)
    legacyHeaders: false,      // Desactiva las cabeceras X-RateLimit-* antiguas
    handler: rateLimitHandler,
    skipSuccessfulRequests: false
});

/**
 * Limita el uso general de la API.
 * Configuración permisiva: 200 peticiones por IP en 15 minutos.
 * Protege contra scraping masivo o clientes mal implementados.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
});

module.exports = { authLimiter, generalLimiter };
