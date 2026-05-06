/**
 * controllers/messageController.js
 * Controlador para la gestión de recordatorios y comunicaciones externas.
 */
const messenger = require('../services/messenger');

/**
 * Envía un recordatorio de cita a un cliente utilizando el servicio de mensajería (WhatsApp/SMS).
 *
 * @async
 * @function remindAppointment
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.client - Nombre o identificador del cliente.
 * @param {string} req.body.date - Fecha de la cita a recordar.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con el resultado del envío del mensaje.
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
 * Envía un mensaje de contacto a un proveedor (por ejemplo, para pedir stock).
 *
 * @async
 * @function contactProvider
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.providerName - Nombre del proveedor a contactar.
 * @param {string} [req.body.productName] - Nombre del producto sobre el cual se consulta.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con el resultado del envío del mensaje.
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
