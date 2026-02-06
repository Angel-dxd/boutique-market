const supabase = require('../config/supabase');

const getDashboardStats = async (req, res) => {
    // Parallel fetching for performance
    const [finanzas, productos, facturas] = await Promise.all([
        supabase.from('finanzas').select('*'),
        supabase.from('productos').select('*'),
        supabase.from('facturas').select('*')
    ]);

    if (finanzas.error) return res.status(500).json({ error: finanzas.error.message });
    if (productos.error) return res.status(500).json({ error: productos.error.message });
    // Facturas might be optional or empty initially

    const transactions = finanzas.data || [];
    const products = productos.data || [];
    const expenses = (facturas.data || []).reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);

    // Semaphor Logic
    let totalIncome = 0;
    let totalExpenses = expenses; // Base from invoices

    transactions.forEach(t => {
        const amount = parseFloat(t.amount || t.monto || 0);
        const type = (t.type || t.tipo || '').toLowerCase();

        if (['income', 'entrada'].includes(type)) {
            totalIncome += amount;
        } else if (['expense', 'salida'].includes(type) && !t.categoria.includes('Factura')) { // Avoid double counting if synced
            totalExpenses += amount;
        }
    });

    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;

    // Health Logic (< 40% expenses/income is Healthy)
    const storedRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100;
    const isHealthy = storedRatio < 40;

    res.json({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        inventoryValue,
        lowStockCount,
        financialHealth: isHealthy ? 'healthy' : 'warning',
        ratio: storedRatio.toFixed(1)
    });
};

module.exports = { getDashboardStats };
