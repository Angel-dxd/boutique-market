const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, getEarningsReport, getDashboardData, importAppointments } = require('../controllers/calendarController');

// Rutas de Agenda (Appointments) usando el Middleware x-tenant-id heredado del server
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.post('/appointments/bulk', importAppointments);
router.get('/earnings', getEarningsReport);
router.get('/dashboard', getDashboardData);

module.exports = router;
