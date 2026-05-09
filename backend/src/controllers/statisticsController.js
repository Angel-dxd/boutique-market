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
        // Ejecutamos las sumas directamente en la base de datos (mucho más rápido)
        const [[financeStats]] = await db.query(`
            SELECT 
                SUM(CASE WHEN LOWER(type) IN ('income', 'entrada') THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN LOWER(type) IN ('expense', 'salida') AND LOWER(category) NOT LIKE '%factura%' THEN amount ELSE 0 END) as total_expenses
            FROM finance
        `);

        const [[inventoryStats]] = await db.query(`
            SELECT 
                SUM(stock * price) as inventory_value,
                COUNT(*) FILTER (WHERE stock <= min_stock) as low_stock_count
            FROM inventory
        `);

        const [[invoiceStats]] = await db.query(`
            SELECT SUM(amount) as invoice_total FROM invoices
        `);

        const totalIncome = parseFloat(financeStats?.total_income || 0);
        const invoiceExpenses = parseFloat(invoiceStats?.invoice_total || 0);
        const otherExpenses = parseFloat(financeStats?.total_expenses || 0);
        const totalExpenses = invoiceExpenses + otherExpenses;
        
        const inventoryValue = parseFloat(inventoryStats?.inventory_value || 0);
        const lowStockCount = parseInt(inventoryStats?.low_stock_count || 0);

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
