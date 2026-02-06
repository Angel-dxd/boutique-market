import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, CreditCard, ShoppingBag, Calendar, LogOut, User, Palette } from 'lucide-react';

const BoutiqueLayout = () => {
    const location = useLocation();
    const themeColor = '#059669'; // Emerald Green

    const menuItems = [
        { name: 'Clientes', path: '/boutique-welcome/clientes', icon: Users },
        { name: 'Finanzas', path: '/boutique-welcome/gastos', icon: CreditCard },
        { name: 'Compras', path: '/boutique-welcome/compras', icon: ShoppingBag },
        { name: 'Calendario', path: '/boutique-welcome/calendario', icon: Calendar },
        { name: 'Mis Uñas', path: '/boutique-welcome/mis-unas', icon: Palette },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-4 top-4 bottom-4 w-64 bg-white shadow-lg rounded-2xl z-10 flex flex-col">
                <div className="flex items-center justify-center h-24 border-b border-gray-100">
                    <Link to="/boutique-welcome" className="text-2xl font-bold tracking-wider" style={{ color: themeColor }}>
                        Oh-Nails
                    </Link>
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                ${isActive
                                        ? 'bg-emerald-50 text-boutique shadow-sm'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-boutique'
                                    }`}
                            >
                                <div className={`mr-3 transition-colors ${isActive ? 'text-boutique' : 'text-gray-400 group-hover:text-boutique'}`}>
                                    <Icon size={20} />
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        to="/logout"
                        state={{ from: 'boutique' }}
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors group"
                    >
                        <LogOut size={20} className="mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
                        Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-72 p-8 flex flex-col min-h-screen">
                <header className="flex justify-end items-center mb-8">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-700">Arelys Marquez</p>
                            <p className="text-xs text-boutique font-medium">Esteticista</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-boutique">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default BoutiqueLayout;
