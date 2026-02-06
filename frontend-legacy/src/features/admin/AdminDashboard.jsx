import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Boutique & Market</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* Boutique Card */}
                <Link to="/boutique" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4a373] to-[#a97142] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative p-8 text-white h-64 flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Estética Marquez</h2>
                            <p className="opacity-90">Gestión de citas, clientes y gastos</p>
                        </div>
                        <div className="flex justify-end">
                            <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                Entrar &rarr;
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Market Card (Placeholder) */}
                <Link to="/market" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative p-8 text-white h-64 flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Pollería & Market</h2>
                            <p className="opacity-90">Control de stock y ventas (Próximamente)</p>
                        </div>
                        <div className="flex justify-end">
                            <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                Entrar &rarr;
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
