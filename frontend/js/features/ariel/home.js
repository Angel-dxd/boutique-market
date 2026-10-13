/**
 * ariel/home.js
 * Vista de resumen (Dashboard) para ARIEL.
 * Muestra KPIs de Rendimiento (Beneficio, Ingresos, Gastos).
 */
import { api } from '../core/api.js';
import { navigateTo } from '../core/app.js';

export const renderMarketHome = async (container) => {
    const render = async () => {
        const financeResponse = await api.get('/finance');
        const finances = financeResponse.error ? [] : (financeResponse.data || financeResponse || []);

        const totalIncome = finances.filter(f => f.type === 'income').reduce((acc, f) => acc + parseFloat(f.amount || 0), 0);
        const totalExpenses = finances.filter(f => f.type === 'expense').reduce((acc, f) => acc + parseFloat(f.amount || 0), 0);
        const rawProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? ((rawProfit / totalIncome) * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6 md:space-y-10">
                <header>
                    <h1 class="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">Ariel Dashboard</h1>
                    <p class="text-gray-500 font-medium text-sm md:text-base">Resumen general del rendimiento</p>
                </header>

                <!-- KPIs -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    
                    <!-- Rendimiento (Beneficio) -->
                    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 md:p-8 rounded-3xl shadow-lg border border-indigo-500 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-white" onclick="window.navigateTo('/dashboard/rendimiento')">
                        <div class="flex justify-between items-start">
                            <p class="text-indigo-100 font-bold uppercase text-xs tracking-wider">Beneficio Bruto</p>
                            <i data-lucide="trending-up" class="w-8 h-8 text-white opacity-80"></i>
                        </div>
                        <div class="mt-6">
                            <h2 class="text-4xl md:text-5xl font-black">${rawProfit.toFixed(2)}€</h2>
                            <p class="text-sm text-indigo-100 mt-2 font-medium bg-white/20 inline-block px-3 py-1.5 rounded-full">Margen de beneficio: ${profitMargin}%</p>
                        </div>
                    </div>

                    <!-- Ingresos -->
                    <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer" onclick="window.navigateTo('/dashboard/rendimiento')">
                        <div class="flex justify-between items-start">
                            <p class="text-gray-400 font-bold uppercase text-xs tracking-wider">Ingresos Totales</p>
                            <div class="p-3 rounded-xl bg-emerald-50 text-emerald-500"><i data-lucide="arrow-up-circle" class="w-6 h-6"></i></div>
                        </div>
                        <div class="mt-4">
                            <h2 class="text-3xl md:text-4xl font-black text-emerald-600">${totalIncome.toFixed(2)}€</h2>
                            <p class="text-sm text-gray-400 mt-2 font-medium">Histórico acumulado</p>
                        </div>
                    </div>

                    <!-- Gastos -->
                    <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer" onclick="window.navigateTo('/dashboard/rendimiento')">
                        <div class="flex justify-between items-start">
                            <p class="text-gray-400 font-bold uppercase text-xs tracking-wider">Gastos Totales</p>
                            <div class="p-3 rounded-xl bg-red-50 text-red-500"><i data-lucide="arrow-down-circle" class="w-6 h-6"></i></div>
                        </div>
                        <div class="mt-4">
                            <h2 class="text-3xl md:text-4xl font-black text-red-500">${totalExpenses.toFixed(2)}€</h2>
                            <p class="text-sm text-gray-400 mt-2 font-medium">Desglosado en módulo</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div>
                    <h3 class="text-base md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Accesos directos</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        
                        <button id="btnFinance" class="p-6 md:p-8 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex items-center gap-6" onclick="window.navigateTo('/dashboard/rendimiento')">
                            <div class="p-4 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <i data-lucide="wallet" class="w-8 h-8"></i>
                            </div>
                            <div>
                                <h4 class="text-lg font-black text-gray-800">Rendimiento Financiero</h4>
                                <p class="text-sm text-gray-500 mt-1">Registrar gastos e ingresos diarios</p>
                            </div>
                        </button>

                        <button id="btnProfile" class="p-6 md:p-8 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex items-center gap-6" onclick="window.navigateTo('/dashboard/perfil')">
                            <div class="p-4 bg-gray-100 text-gray-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <i data-lucide="user" class="w-8 h-8"></i>
                            </div>
                            <div>
                                <h4 class="text-lg font-black text-gray-800">Mi Perfil</h4>
                                <p class="text-sm text-gray-500 mt-1">Ajustar datos personales y preferencias</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        // Hack for global navigation from onclick
        window.navigateTo = navigateTo;
    };
    await render();
};
