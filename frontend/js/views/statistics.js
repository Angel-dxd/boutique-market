const renderStatistics = async () => {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="text-center p-10">Calculando finanzas...</div>';

    const stats = await api.get('/dashboard/stats');

    if (stats.error) {
        content.innerHTML = `<div class="text-red-500 p-10">Error: ${stats.error}</div>`;
        return;
    }

    const healthColor = stats.financialHealth === 'healthy' ? 'bg-green-500' : 'bg-orange-500';
    const healthText = stats.financialHealth === 'healthy' ? 'SALUDABLE' : 'ALERTA';
    const healthDesc = stats.financialHealth === 'healthy' ? 'Gastos bajo control (<40%)' : 'Gastos elevados (>40%)';

    content.innerHTML = `
        <h1 class="text-3xl font-black text-slate-800 mb-8">Estadísticas Market</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Health Card -->
            <div class="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-24 h-24 ${healthColor} rounded-full blur-2xl opacity-50"></div>
                <h3 class="text-slate-400 font-bold mb-1">Salud Financiera</h3>
                <div class="flex items-end gap-2 mb-2">
                    <span class="text-4xl font-black">${healthText}</span>
                </div>
                <p class="text-sm opacity-80">${healthDesc}</p>
                <div class="mt-4 w-full bg-slate-800 rounded-full h-2">
                    <div class="h-2 rounded-full ${healthColor}" style="width: ${Math.min(stats.ratio, 100)}%"></div>
                </div>
            </div>

            <!-- Inventory Value -->
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div class="flex items-center gap-3 mb-4 text-indigo-600">
                    <div class="p-2 bg-indigo-50 rounded-xl"><i data-lucide="package"></i></div>
                    <span class="font-bold">Valor Inventario</span>
                </div>
                <p class="text-3xl font-black text-slate-800">${stats.inventoryValue.toFixed(2)}€</p>
                <p class="text-xs text-slate-400 font-bold mt-2">P.V.P Total</p>
            </div>

             <!-- Low Stock -->
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div class="flex items-center gap-3 mb-4 text-red-500">
                    <div class="p-2 bg-red-50 rounded-xl"><i data-lucide="alert-triangle"></i></div>
                    <span class="font-bold">Bajo Stock</span>
                </div>
                <p class="text-3xl font-black text-slate-800">${stats.lowStockCount}</p>
                <p class="text-xs text-slate-400 font-bold mt-2">Productos a reponer</p>
            </div>

             <!-- Net Profit -->
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div class="flex items-center gap-3 mb-4 text-emerald-600">
                    <div class="p-2 bg-emerald-50 rounded-xl"><i data-lucide="trending-up"></i></div>
                    <span class="font-bold">Beneficio Neto</span>
                </div>
                <p class="text-3xl font-black text-slate-800">${stats.netProfit.toFixed(2)}€</p>
                <p class="text-xs text-slate-400 font-bold mt-2">Ingresos - Gastos</p>
            </div>
        </div>

        <!-- Charts (Placeholder for Vanilla Chart.js or CSS Charts) -->
        <h2 class="text-xl font-black text-slate-800 mb-4">Resumen Mensual</h2>
        <div class="bg-white p-8 rounded-3xl border border-slate-100 h-64 flex items-center justify-center text-slate-400 font-bold">
            [Gráfico Visual Simplificado - Próximamente]
        </div>
    `;
    lucide.createIcons();
};
