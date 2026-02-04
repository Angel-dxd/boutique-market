import React from 'react';
import { ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

const MarketHome = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Hola, Santi</h2>
                <p className="text-gray-500 mt-1">Panel de Control - El Gallo Azul 🐔</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pedidos Hoy</p>
                        <h3 className="text-3xl font-bold text-gray-800">24</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 text-market">
                        <ShoppingCart />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Ingresos Hoy</p>
                        <h3 className="text-3xl font-bold text-gray-800">€450</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 text-market">
                        <DollarSign />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Rendimiento</p>
                        <h3 className="text-3xl font-bold text-green-500">+12%</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 text-green-500">
                        <TrendingUp />
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center text-market">
                <p className="font-semibold">Módulo de Pollería en Construcción...</p>
            </div>
        </div>
    );
};

export default MarketHome;
