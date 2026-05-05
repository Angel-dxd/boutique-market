/**
 * routes/statisticsRoutes.js
 * Rutas para la obtención de estadísticas del dashboard.
 */
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statisticsController');

router.get('/stats', getDashboardStats);

module.exports = router;
