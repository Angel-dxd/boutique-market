import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

const ExpensesDashboard = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel de Gastos</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Gastos Totales (Mes)</p>
                            <h3 className="text-3xl font-bold text-gray-800">€2,450</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl text-red-500">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-red-500 flex items-center">
                        <span className="font-bold mr-1">+12%</span> vs mes anterior
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Ingresos Estimados</p>
                            <h3 className="text-3xl font-bold text-gray-800">€5,800</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl text-green-500">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-green-500 flex items-center">
                        <span className="font-bold mr-1">+5%</span> vs mes anterior
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Margen Neto</p>
                            <h3 className="text-3xl font-bold text-gray-800">€3,350</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Chart Placeholder */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-700">Flujo de Caja Anual</h3>
                        <select className="text-sm border-none bg-gray-50 rounded-lg p-2 text-gray-500 focus:outline-none">
                            <option>2026</option>
                            <option>2025</option>
                        </select>
                    </div>
                    {/* Visual Placeholder for Chart */}
                    <div className="flex-1 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-10 flex items-end justify-between px-10 pb-10 gap-4">
                            {[40, 60, 30, 80, 50, 90, 70, 40, 60, 80, 50, 70].map((h, i) => (
                                <div key={i} className="w-full bg-[#d4a373] rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="text-center z-10">
                            <TrendingUp size={48} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-400 font-medium">Gráfico de Línea (Chart.js)</p>
                            <p className="text-xs text-gray-300">Pendiente de integrar librería</p>
                        </div>
                    </div>
                </div>

                {/* Secondary Chart Placeholder */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
                    <h3 className="font-bold text-gray-700 mb-6">Desglose de Gastos</h3>
                    <div className="flex-1 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <PieChart size={48} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-400 font-medium">Gráfico Circular (Chart.js)</p>
                            <p className="text-xs text-gray-300">Inventario vs Servicios vs Alquiler</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpensesDashboard;
