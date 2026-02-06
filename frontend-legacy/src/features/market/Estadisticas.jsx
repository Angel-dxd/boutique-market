import React from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar } from 'lucide-react';

const Estadisticas = () => {
    const { facturas, products, proveedores, isLoading } = useBoutique();

    if (isLoading) return <div className="p-10 text-center text-blue-500">Calculando números...</div>;

    // --- Metrics Calculations ---
    const totalGastos = facturas.reduce((acc, f) => acc + parseFloat(f.monto || 0), 0);
    const totalInventarioValor = products.reduce((acc, p) => acc + (parseFloat(p.stock || 0) * parseFloat(p.price || 0)), 0);

    // Group Expenses by Month (Simple approximation)
    const expensesByMonth = facturas.reduce((acc, f) => {
        const date = new Date(f.created_at || f.fecha || new Date());
        const month = date.toLocaleString('es-ES', { month: 'short' });
        acc[month] = (acc[month] || 0) + parseFloat(f.monto || 0);
        return acc;
    }, {});

    const chartData = Object.keys(expensesByMonth).map(m => ({
        name: m,
        gastos: expensesByMonth[m]
    }));

    // Find max value for scaling bar chart
    const maxGasto = Math.max(...chartData.map(d => d.gastos), 1);

    // Top Proveedores
    const gastosPorProveedor = facturas.reduce((acc, f) => {
        acc[f.proveedor_id] = (acc[f.proveedor_id] || 0) + parseFloat(f.monto || 0);
        return acc;
    }, {});

    const topProveedores = Object.entries(gastosPorProveedor)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id, amount]) => {
            const prov = proveedores.find(p => p.id === parseInt(id));
            return { name: prov?.nombre || 'Desconocido', amount };
        });

    // --- Semáforo de Rentabilidad ---
    // Asumimos 'entradas' en finanzas como Ventas
    const { transactions } = useBoutique();
    const ventasTotales = transactions
        .filter(t => t.tipo === 'entrada' || t.tipo === 'income')
        .reduce((acc, t) => acc + parseFloat(t.monto || 0), 0) || 1; // Avoid div/0

    const ratioGasto = (totalGastos / ventasTotales) * 100;
    const isWarning = ratioGasto > 40;

    // CSS Donut Chart for Semáforo
    const donutDegrees = Math.min((totalGastos / ventasTotales) * 360, 360);

    return (
        <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Estadísticas de Mercado</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total Gastos</p>
                        <h2 className="text-3xl font-black text-gray-800 mt-1">€{totalGastos.toFixed(2)}</h2>
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1 mt-2">
                            <TrendingDown size={14} /> Salidas
                        </span>
                    </div>
                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl"><DollarSign size={24} /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Valor Inventario</p>
                        <h2 className="text-3xl font-black text-gray-800 mt-1">€{totalInventarioValor.toFixed(2)}</h2>
                        <span className="text-xs font-bold text-blue-500 flex items-center gap-1 mt-2">
                            <TrendingUp size={14} /> Activos
                        </span>
                    </div>
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><PieChart size={24} /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Productos Totales</p>
                        <h2 className="text-3xl font-black text-gray-800 mt-1">{products.length}</h2>
                        <span className="text-xs font-bold text-green-500 flex items-center gap-1 mt-2">
                            <TrendingUp size={14} /> Catálogo
                        </span>
                    </div>
                    <div className="p-4 bg-green-50 text-green-500 rounded-2xl"><Calendar size={24} /></div>
                </div>

                {/* Feature 1: Semáforo */}
                <div className={`p-6 rounded-3xl shadow-sm border relative overflow-hidden flex flex-col justify-center ${isWarning ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                    <div className="relative z-10">
                        <p className={`font-bold uppercase text-xs tracking-wider mb-1 ${isWarning ? 'text-orange-600' : 'text-green-600'}`}>
                            Salud Financiera
                        </p>
                        <h2 className={`text-3xl font-black ${isWarning ? 'text-orange-700' : 'text-green-700'}`}>
                            {ratioGasto.toFixed(1)}%
                        </h2>
                        <p className="text-xs font-bold text-gray-500 mt-1">Gasto sobre Venta</p>
                    </div>
                    {isWarning && <div className="absolute right-4 top-4 text-orange-300 opacity-20"><TrendingDown size={80} /></div>}
                    {!isWarning && <div className="absolute right-4 top-4 text-green-300 opacity-20"><TrendingUp size={80} /></div>}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Expenses Chart - Visual CSS Bar Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Gastos Mensuales</h3>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {chartData.length > 0 ? chartData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="relative w-full max-w-[40px] bg-red-100 rounded-t-xl overflow-hidden group-hover:bg-red-200 transition-colors" style={{ height: `${(d.gastos / maxGasto) * 100}%` }}>
                                    <div className="absolute bottom-0 w-full bg-red-500 rounded-t-xl transition-all duration-500" style={{ height: '100%' }}></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        €{d.gastos}
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400 mt-2 uppercase">{d.name}</span>
                            </div>
                        )) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No hay datos de gastos</div>
                        )}
                    </div>
                </div>

                {/* Top Suppliers List */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Top Proveedores (Gasto)</h3>
                    <div className="space-y-6">
                        {topProveedores.length > 0 ? topProveedores.map((p, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-500 text-sm">
                                        {i + 1}
                                    </span>
                                    <span className="font-bold text-gray-700">{p.name}</span>
                                </div>
                                <span className="font-black text-gray-800">€{p.amount.toFixed(2)}</span>
                            </div>
                        )) : (
                            <p className="text-gray-400 italic">No hay datos suficientes.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Estadisticas;
