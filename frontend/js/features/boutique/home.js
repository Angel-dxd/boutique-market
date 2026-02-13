
export const renderBoutiqueHome = (container) => {
    // Determine greeting - could get from user state in future
    const userName = 'Arelys'; // Hardcoded for now as per requirement

    // Mock Data
    const cards = [
        { title: 'Citas de hoy', value: '8', icon: 'calendar' },
        { title: 'Citas de mañana', value: '5', icon: 'calendar' },
        { title: 'Clientes totales', value: '120', icon: 'users' },
    ];

    const topClients = [
        { name: 'Lucía Méndez', visits: 12 },
        { name: 'Carmen Rojas', visits: 9 },
        { name: 'Patricia L.', visits: 8 },
        { name: 'Elena Gómez', visits: 7 },
        { name: 'Raquel V.', visits: 6 },
    ];

    // Build HTML
    container.innerHTML = `
        <div class="space-y-8">
            <!-- Header -->
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">Hola, ${userName}</h2>
                    <p class="text-gray-500 mt-1">Resumen de tu actividad en Oh-Nails</p>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${cards.map(card => `
                    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-50 hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
                        <div>
                            <p class="text-sm font-medium text-gray-500 mb-1">${card.title}</p>
                            <h3 class="text-4xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">${card.value}</h3>
                        </div>
                        <div class="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                             <i data-lucide="${card.icon}"></i>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Quick Actions -->
                <div class="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-50">
                    <h3 class="text-lg font-semibold text-gray-800 mb-6">Acciones Rápidas</h3>
                    <div class="flex flex-wrap gap-4">
                        <button class="flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 text-white font-medium transition-all active:scale-95 shadow-md hover:shadow-lg hover:opacity-90">
                            <i data-lucide="plus"></i>
                            Nueva Cita
                        </button>

                        <button class="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-emerald-600 text-emerald-600 font-medium transition-colors hover:bg-emerald-50">
                            <i data-lucide="dollar-sign"></i>
                            Registrar Gasto
                        </button>

                        <button onclick="window.location.href = '/boutique-welcome/gift-cards'"
                            class="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-pink-500 text-pink-500 font-medium transition-colors hover:bg-pink-50">
                            <i data-lucide="gift"></i>
                            Tarjetas Regalo
                        </button>
                    </div>
                </div>

                <!-- Mis Fieles (Top Clients) -->
                <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-50">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        👑 Mis Fieles <span class="text-xs font-normal text-gray-400">(Top 5)</span>
                    </h3>
                    <div class="space-y-4">
                        ${topClients.map((client, i) => `
                            <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-300'}">
                                        ${i + 1}
                                    </div>
                                    <span class="font-medium text-gray-700">${client.name}</span>
                                </div>
                                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                    ${client.visits} visitas
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
};
