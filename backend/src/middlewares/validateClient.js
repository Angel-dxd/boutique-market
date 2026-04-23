// middlewares/validateClient.js
const { clientSchema } = require('../utils/schemas');

/**
 * Validaciones para creación y actualización de clientes.
 * Se usa como middleware antes de llegar al controlador.
 */

/**
 * Valida y limpia el body para crear o editar un cliente usando Zod.
 * Aplica a POST y PUT /api/clients
 */
exports.validateClientBody = (req, res, next) => {
    try {
        const parsed = clientSchema.parse(req.body);
        
        // Limpieza de espacios en phone (Zod parsea y limpia pero por asegurar)
        if (parsed.phone) {
            parsed.phone = parsed.phone.replace(/\s+/g, '');
        }
        
        req.body = parsed;
        next();
    } catch (error) {
        if (error.errors) {
            const errorMessages = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                errors: errorMessages
            });
        }
        next(error);
    }
};

/**
 * Valida que el :id del param sea un entero positivo.
 * Aplica a PUT, DELETE /api/clients/:id
 */
exports.validateClientId = (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            errors: ["El ID del cliente debe ser un número entero positivo."]
        });
    }
    req.params.id = id; // sobreescribimos con el número ya parseado
    next();
};