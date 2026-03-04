const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment } = require('../controllers/calendarController');

// Rutas de Agenda (Appointments) usando el Middleware x-tenant-id heredado del server
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);

module.exports = router;
