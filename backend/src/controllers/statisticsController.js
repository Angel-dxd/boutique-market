/**
 * controllers/statisticsController.js
 * Generación de estadísticas y KPIs para el dashboard central.
 */
const db = require('../config/db');

/**
 * Calcula estadísticas agregadas para el dashboard general.
 *
 * Consolida datos de finanzas, inventario y facturas para generar
 * KPIs como ingresos totales, gastos totales, valor del inventario
 * y salud financiera.
 *
 * @async
 * @function getDashboardStats
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con todas las métricas calculadas.
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const [financeRows] = await db.query('SELECT * FROM finance');
        const [inventoryRows] = await db.query('SELECT * FROM inventory');
        const [invoicesRows] = await db.query('SELECT * FROM invoices');

        const expenses = (invoicesRows || []).reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
        let totalIncome = 0;
        let totalExpenses = expenses;

        (financeRows || []).forEach(t => {
            const amount = parseFloat(t.amount || 0);
            const type = (t.type || '').toLowerCase();
            const category = (t.category || '').toLowerCase();

            if (['income', 'entrada'].includes(type)) {
                totalIncome += amount;
            } else if (['expense', 'salida'].includes(type) && !category.includes('factura')) {
                totalExpenses += amount;
            }
        });

        const inventoryValue = (inventoryRows || []).reduce((sum, p) => sum + (p.stock * p.price), 0);
        const lowStockCount = (inventoryRows || []).filter(p => p.stock <= p.min_stock).length;

        const storedRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100;

        res.json({
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            inventoryValue,
            lowStockCount,
            financialHealth: storedRatio < 40 ? 'healthy' : 'warning',
            ratio: storedRatio.toFixed(1)
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getDashboardStats };
