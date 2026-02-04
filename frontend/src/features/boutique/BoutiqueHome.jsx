import React from 'react';

const BoutiqueHome = () => {
    const themeColor = '#059669'; // Emerald

    // SVG Icons
    const CalendarIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    );

    const UsersIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    );

    const PlusIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );

    const DollarIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    );

    const cards = [
        { title: 'Citas de hoy', value: '8', icon: CalendarIcon },
        { title: 'Citas de mañana', value: '5', icon: CalendarIcon },
        { title: 'Clientes totales', value: '120', icon: UsersIcon },
    ];

    const topClients = [
        { name: 'Lucía Méndez', visits: 12 },
        { name: 'Carmen Rojas', visits: 9 },
        { name: 'Patricia L.', visits: 8 },
        { name: 'Elena Gómez', visits: 7 },
        { name: 'Raquel V.', visits: 6 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Hola, Arelys</h2>
                    <p className="text-gray-500 mt-1">Resumen de tu actividad en Oh-Nails</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-50 hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                            <h3 className="text-4xl font-bold text-gray-800 group-hover:text-boutique transition-colors">{card.value}</h3>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-50 text-boutique">
                            <card.icon />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Acciones Rápidas</h3>
                    <div className="flex flex-wrap gap-4">
                        <button
                            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-boutique text-white font-medium transition-all active:scale-95 shadow-md hover:shadow-lg hover:opacity-90"
                        >
                            <PlusIcon />
                            Nueva Cita
                        </button>

                        <button
                            className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-boutique text-boutique font-medium transition-colors hover:bg-emerald-50"
                        >
                            <DollarIcon />
                            Registrar Gasto
                        </button>

                        <button
                            onClick={() => window.location.href = '/boutique-welcome/gift-cards'}
                            className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-pink-500 text-pink-500 font-medium transition-colors hover:bg-pink-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                            Tarjetas Regalo
                        </button>
                    </div>
                </div>

                {/* Mis Fieles (Top Clients) */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        👑 Mis Fieles <span className="text-xs font-normal text-gray-400">(Top 5)</span>
                    </h3>
                    <div className="space-y-4">
                        {topClients.map((client, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-300'}`}>
                                        {i + 1}
                                    </div>
                                    <span className="font-medium text-gray-700">{client.name}</span>
                                </div>
                                <span className="text-xs font-bold text-boutique bg-emerald-50 px-2 py-1 rounded-md">
                                    {client.visits} visitas
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoutiqueHome;
