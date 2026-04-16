// middlewares/validateClient.js

/**
 * Validaciones para creación y actualización de clientes.
 * Se usa como middleware antes de llegar al controlador.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s\-().]{7,20}$/;

/**
 * Valida y limpia el body para crear o editar un cliente.
 * Aplica a POST y PUT /api/clients
 */
exports.validateClientBody = (req, res, next) => {
    const errors = [];
    let { name, phone, email, notes } = req.body;

    // --- Nombre ---
    if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.push("El nombre del cliente es obligatorio.");
    } else if (name.trim().length > 100) {
        errors.push("El nombre no puede superar los 100 caracteres.");
    }

    // --- Teléfono (opcional) ---
    if (phone !== undefined && phone !== null && phone !== '') {
        const cleanPhone = phone.toString().replace(/\s+/g, '');
        if (!PHONE_REGEX.test(cleanPhone)) {
            errors.push("El teléfono no tiene un formato válido (7-20 dígitos).");
        }
    }

    // --- Email (opcional) ---
    if (email !== undefined && email !== null && email !== '') {
        if (!EMAIL_REGEX.test(email)) {
            errors.push("El email no tiene un formato válido.");
        } else if (email.length > 150) {
            errors.push("El email no puede superar los 150 caracteres.");
        }
    }

    // --- Notas (opcional) ---
    if (notes && notes.length > 500) {
        errors.push("Las notas no pueden superar los 500 caracteres.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    // Limpieza centralizada — el controlador recibe datos ya saneados
    req.body.name = name.trim();
    req.body.phone = phone ? phone.toString().replace(/\s+/g, '') : null;
    req.body.email = email || null;
    req.body.notes = notes || null;

    next();
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