/**
 * routes/calendarRoutes.js
 * Rutas para la gestión de la agenda (Boutique).
 */
const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, getEarningsReport, getDashboardData, importAppointments } = require('../controllers/calendarController');

/**
 * @route GET /api/calendar/appointments
 * @description Obtiene todas las citas activas de la agenda.
 * @access Private
 * @controller calendarController.getAppointments
 */
router.get('/appointments', getAppointments);

/**
 * @route POST /api/calendar/appointments
 * @description Crea una nueva cita en la agenda.
 * @access Private
 * @controller calendarController.createAppointment
 */
router.post('/appointments', createAppointment);

/**
 * @route POST /api/calendar/appointments/bulk
 * @description Importación masiva de citas desde un CSV o arreglo.
 * @access Private
 * @controller calendarController.importAppointments
 */
router.post('/appointments/bulk', importAppointments);

/**
 * @route GET /api/calendar/earnings
 * @description Obtiene el reporte de ingresos (Hoy, Mes, Año).
 * @access Private
 * @controller calendarController.getEarningsReport
 */
router.get('/earnings', getEarningsReport);

/**
 * @route GET /api/calendar/dashboard
 * @description Obtiene datos resumidos para la vista principal de la agenda.
 * @access Private
 * @controller calendarController.getDashboardData
 */
router.get('/dashboard', getDashboardData);

module.exports = router;
