const jwt = require('jsonwebtoken');

const getBearerToken = (authorizationHeader = '') => {
    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    return token;
};

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

const attachAuthIfPresent = (req, res, next) => {
    const error = verifyTokenAndAttachUser(req, { required: false });
    if (error) return res.status(error.status).json(error.body);
    next();
};

module.exports = {
    requireAuth,
    attachAuthIfPresent
};
