/**
 * controllers/messageController.js
 * Controlador para la gestión de recordatorios y comunicaciones externas.
 */
const messenger = require('../services/messenger');

/**
 * Envía un recordatorio de cita a un cliente (vía WhatsApp/SMS).
 * @route POST /api/messages/remind
 */
const remindAppointment = async (req, res, next) => {
    try {
        const { client, date } = req.body;
        if (!client || !date) return res.status(400).json({ error: 'Falta cliente o fecha para el recordatorio.' });

        const result = await messenger.sendMessage('remind-appointment', { client, date });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * Envía un mensaje de contacto a un proveedor (p. ej. para pedido de stock).
 * @route POST /api/messages/contact-provider
 */
const contactProvider = async (req, res, next) => {
    try {
        const { providerName, productName } = req.body;
        if (!providerName) return res.status(400).json({ error: 'Falta nombre del proveedor.' });

        const result = await messenger.sendMessage('contact-provider', { providerName, productName });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

module.exports = { remindAppointment, contactProvider };
