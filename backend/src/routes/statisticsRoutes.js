/**
 * routes/statisticsRoutes.js
 * Rutas para la obtención de estadísticas del dashboard.
 */
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statisticsController');

/**
 * @route GET /api/dashboard/stats
 * @description Obtiene estadísticas y KPIs agregados para el dashboard principal.
 * @access Private
 * @controller statisticsController.getDashboardStats
 */
router.get('/stats', getDashboardStats);

module.exports = router;
