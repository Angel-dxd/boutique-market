import { api } from '../../api.js';

export const renderBoutiqueHome = async (container) => {
    const userName = 'Arelys';

    // Obtención dinámica del contador de clientes del tenant
    const clientsRes = await api.get('/clients');
    const realClientCount = Array.isArray(clientsRes) ? clientsRes.length : 0;

    // Calcular las fechas para enviar al backend
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Consultar el nuevo endpoint sincronizado
    const dashRes = await api.get(`/calendar/dashboard?today=${formatDate(today)}&tomorrow=${formatDate(tomorrow)}`);

    // Si error o falla la BD, defaults seguros
    const todayList = dashRes.error ? [] : (dashRes.today || []);
    const tomorrowList = dashRes.error ? [] : (dashRes.tomorrow || []);
    const topClients = dashRes.error ? [] : (dashRes.topClients || []);

    const cards = [
        { title: 'Citas de hoy', value: todayList.length.toString(), icon: 'calendar' },
        { title: 'Citas de mañana', value: tomorrowList.length.toString(), icon: 'calendar' },
        { title: 'Clientes totales', value: realClientCount.toString(), icon: 'users' },
    ];

    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Header con Acción Rápida Integrada -->
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">Hola, ${userName}</h2>
                    <p class="text-gray-500 mt-1">Resumen de tu actividad en Oh-Nails</p>
                </div>
                <!-- Botón Limpio Moviendo la Acción Rápida Arriba -->
                <button onclick="window.location.hash = '#/boutique/calendar'" data-link href="/boutique-welcome/calendario" class="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium transition-all shadow-md hover:shadow-lg hover:opacity-90">
                    <i data-lucide="calendar-plus" width="20"></i>
                    Programar Cita
                </button>
            </div>

            <!-- Stats/Metric Cards -->
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

            <!-- Listas Dinámicas (Reales) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Citas de Hoy -->
                <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-50">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i data-lucide="sun" class="text-orange-500" width="20"></i> Citas de hoy
                    </h3>
                    <div class="space-y-3">
                        ${todayList.length === 0
            ? `<p class="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">No hay citas programadas</p>`
            : todayList.map(apt => `
                                <div class="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-emerald-50 transition-colors group">
                                    <div>
                                        <p class="font-bold text-gray-800 text-sm group-hover:text-emerald-700">${apt.client}</p>
                                        <p class="text-xs text-gray-500 font-medium">${apt.time}</p>
                                    </div>
                                    <span class="text-sm font-bold text-emerald-600">${apt.price}€</span>
                                </div>
                            `).join('')
        }
                    </div>
                </div>

                <!-- Citas para Mañana -->
                <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-50">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i data-lucide="calendar-clock" class="text-blue-500" width="20"></i> Citas para mañana
                    </h3>
                    <div class="space-y-3">
                        ${tomorrowList.length === 0
            ? `<p class="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">No hay citas programadas</p>`
            : tomorrowList.map(apt => `
                                <div class="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50 transition-colors group">
                                    <div>
                                        <p class="font-bold text-gray-800 text-sm group-hover:text-blue-700">${apt.client}</p>
                                        <p class="text-xs text-gray-500 font-medium">${apt.time}</p>
                                    </div>
                                    <span class="text-sm font-bold text-emerald-600">${apt.price}€</span>
                                </div>
                            `).join('')
        }
                    </div>
                </div>

                <!-- Mis Fieles (Top Clients Real) -->
                <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-50">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        👑 Mis Fieles <span class="text-xs font-normal text-gray-400">(Top 5)</span>
                    </h3>
                    <div class="space-y-4">
                        ${topClients.length === 0
            ? `<p class="text-sm text-gray-400 text-center py-4">Aún no hay historial suficiente</p>`
            : topClients.map((client, i) => `
                                <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-300'}">
                                            ${i + 1}
                                        </div>
                                        <span class="font-medium text-gray-700">${client.name}</span>
                                    </div>
                                    <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                        ${client.visits} visitas
                                    </span>
                                </div>
                            `).join('')
        }
                    </div>
                </div>
            </div>
            
            <!-- Mobile Action Button (Shows only on small screens) -->
            <button data-link href="/boutique-welcome/calendario" class="md:hidden w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 text-white font-bold transition-all shadow-lg active:scale-95">
                <i data-lucide="calendar-plus" width="20"></i>
                Programar Nueva Cita
            </button>
        </div>
    `;

    lucide.createIcons();
};
