/**
 * routes/calendarRoutes.js
 * Rutas para la gestión de la agenda (Boutique).
 */
const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, getEarningsReport, getDashboardData, importAppointments } = require('../controllers/calendarController');

// Gestión de citas
router.get('/appointments', getAppointments);      // Obtener todas las citas
router.post('/appointments', createAppointment);     // Crear nueva cita
router.post('/appointments/bulk', importAppointments); // Importación masiva (CSV)

// Datos agregados
router.get('/earnings', getEarningsReport);        // Reporte de ingresos (Hoy/Mes/Año)
router.get('/dashboard', getDashboardData);       // Datos para la vista de resumen

module.exports = router;
