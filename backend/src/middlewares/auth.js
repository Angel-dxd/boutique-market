/**
 * middlewares/auth.js
 * Middleware para la verificación de tokens JWT y gestión del contexto de tenant.
 */
const jwt = require('jsonwebtoken');

/**
 * Extrae el token Bearer de la cabecera Authorization.
 * @param {string} authorizationHeader 
 * @returns {string|null}
 */
const getBearerToken = (authorizationHeader = '') => {
    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    return token;
};

/**
 * Verifica el token JWT y asocia el usuario a la petición (`req.user`).
 * También valida que el tenant (inquilino) coincida entre el token y la cabecera.
 * 
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} options - Opciones de validación.
 * @param {boolean} options.required - Si es true, fallará si no hay token. Si es false, permitirá seguir.
 * @returns {Object|null} Retorna un objeto de error si falla, o null si todo es correcto.
 */
const verifyTokenAndAttachUser = (req, { required }) => {

    const token = getBearerToken(req.headers.authorization);
    if (!token && !required) return null;
    if (!token && required) {
        return {
            status: 401,
            body: { success: false, errors: ['No autorizado: token requerido.'] }
        };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return {
            status: 500,
            body: { success: false, errors: ['JWT no configurado en el servidor.'] }
        };
    }

    try {
        const decoded = jwt.verify(token, secret);
        const tenantFromToken = decoded.tenant;
        const tenantFromHeader = req.headers['x-tenant-id'];

        if (!tenantFromToken) {
            return {
                status: 401,
                body: { success: false, errors: ['Token inválido: tenant ausente.'] }
            };
        }

        if (tenantFromHeader && tenantFromHeader !== tenantFromToken) {
            return {
                status: 403,
                body: { success: false, errors: ['No autorizado: tenant no coincide con el token.'] }
            };
        }

        req.headers['x-tenant-id'] = tenantFromToken;
        req.user = {
            id: decoded.sub,
            username: decoded.username,
            tenant: tenantFromToken
        };
        return null;
    } catch (error) {
        return {
            status: 401,
            body: { success: false, errors: ['No autorizado: token inválido o expirado.'] }
        };
    }
};

/**
 * Middleware que obliga a tener una sesión válida (JWT).
 * Se usa para proteger rutas privadas.
 */
const requireAuth = (req, res, next) => {
    try {
        const error = verifyTokenAndAttachUser(req, { required: true });
        if (error) return res.status(error.status).json(error.body);
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            errors: ['No autorizado: token inválido o expirado.']
        });
    }
};

/**
 * Middleware opcional: si hay token, adjunta el usuario, si no, permite continuar.
 * Útil para rutas que pueden comportarse distinto según si hay sesión (ej. registro).
 */
const attachAuthIfPresent = (req, res, next) => {
    const error = verifyTokenAndAttachUser(req, { required: false });
    if (error) return res.status(error.status).json(error.body);
    next();
};

module.exports = {
    requireAuth,
    attachAuthIfPresent
};
