/**
 * routes/messageRoutes.js
 * Rutas para el envío de notificaciones y recordatorios.
 */
const express = require('express');
const router = express.Router();
const { remindAppointment, contactProvider } = require('../controllers/messageController');

/**
 * @route POST /api/messages/remind-client
 * @description Envía un recordatorio de cita a un cliente vía WhatsApp/SMS.
 * @access Private
 * @controller messageController.remindAppointment
 */
router.post('/remind-client', remindAppointment);

/**
 * @route POST /api/messages/contact-provider
 * @description Envía un mensaje a un proveedor para pedir stock o información.
 * @access Private
 * @controller messageController.contactProvider
 */
router.post('/contact-provider', contactProvider);

module.exports = router;
