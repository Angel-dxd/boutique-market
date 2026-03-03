const db = require('../config/db');

const getDashboardStats = async (req, res, next) => {
    try {
        const [finanzasRows] = await db.query('SELECT * FROM finanzas');
        const [productosRows] = await db.query('SELECT * FROM productos');
        const [facturasRows] = await db.query('SELECT * FROM facturas');

        const expenses = (facturasRows || []).reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
        let totalIncome = 0;
        let totalExpenses = expenses;

        (finanzasRows || []).forEach(t => {
            const amount = parseFloat(t.monto || 0);
            const type = (t.tipo || '').toLowerCase();
            const category = (t.categoria || '').toLowerCase();

            if (['income', 'entrada'].includes(type)) {
                totalIncome += amount;
            } else if (['expense', 'salida'].includes(type) && !category.includes('factura')) {
                totalExpenses += amount;
            }
        });

        const inventoryValue = (productosRows || []).reduce((sum, p) => sum + (p.stock * p.price), 0);
        const lowStockCount = (productosRows || []).filter(p => p.stock <= p.min_stock).length;

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
