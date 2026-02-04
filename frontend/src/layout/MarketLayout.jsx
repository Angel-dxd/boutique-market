import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, User, BarChart2, Package } from 'lucide-react';

const MarketLayout = () => {
    const location = useLocation();
    const themeColor = '#0077b6'; // Blue

    const menuItems = [
        { name: 'Pedidos', path: '/market/pedidos', icon: ShoppingCart },
        { name: 'Inventario', path: '/market/inventario', icon: Package },
        { name: 'Estadísticas', path: '/market/estadisticas', icon: BarChart2 },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-4 top-4 bottom-4 w-64 bg-white shadow-lg rounded-2xl z-10 flex flex-col">
                <div className="flex items-center justify-center h-24 border-b border-gray-100">
                    <h1 className="text-2xl font-bold tracking-wider text-market">
                        El Gallo Azul
                    </h1>
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-blue-50 text-market shadow-sm'
                                        : 'text-gray-600 hover:bg-blue-50 hover:text-market'
                                    }`}
                            >
                                <div className={`mr-3 transition-colors ${isActive ? 'text-market' : 'text-gray-400 group-hover:text-market'}`}>
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
                        state={{ from: 'market' }}
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors group"
                    >
                        <LogOut size={20} className="mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
                        Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-8 flex flex-col min-h-screen">
                <header className="flex justify-end items-center mb-8">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-700">Santi</p>
                            <p className="text-xs text-market font-medium">Gerente</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-market">
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

export default MarketLayout;
