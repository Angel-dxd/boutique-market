import { store } from '../../store.js';

export const renderEstadisticas = (container) => {
    const render = () => {
        const state = store.getState();
        const invoices = state.invoices || [];
        const products = state.products || [];

        // Calculated Metrics
        const totalDebt = invoices.reduce((sum, inv) => sum + parseFloat(inv.monto || 0), 0);
        const totalStockValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.stock)), 0);
        const lowStockCount = products.filter(p => parseInt(p.stock) <= parseInt(p.min_stock)).length;

        // Simple Financial Health Logic
        let healthColor = 'bg-yellow-100 text-yellow-600';
        let healthText = 'Regular';

        if (totalDebt === 0 && lowStockCount === 0) {
            healthColor = 'bg-emerald-100 text-emerald-600';
            healthText = 'Excelente';
        } else if (totalDebt > 1000 || lowStockCount > 5) {
            healthColor = 'bg-red-100 text-red-600';
            healthText = 'Atención Requerida';
        }

        container.innerHTML = `
            <div class="p-8 w-full max-w-7xl mx-auto">
                <h1 class="text-3xl font-black text-gray-800 mb-8">Estadísticas & Reportes</h1>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-gray-400 font-bold text-xs uppercase">Salud Financiera</p>
                        <div class="mt-2 inline-block px-3 py-1 rounded-full font-bold text-sm ${healthColor}">
                            ${healthText}
                        </div>
                    </div>
                     <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-gray-400 font-bold text-xs uppercase">Deuda Total</p>
                        <p class="text-2xl font-black text-gray-800 mt-1">${totalDebt.toFixed(2)}€</p>
                    </div>
                     <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-gray-400 font-bold text-xs uppercase">Valor Inventario</p>
                        <p class="text-2xl font-black text-gray-800 mt-1">${totalStockValue.toFixed(2)}€</p>
                    </div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-gray-400 font-bold text-xs uppercase">Stock Bajo</p>
                         <p class="text-2xl font-black ${lowStockCount > 0 ? 'text-red-500' : 'text-gray-800'} mt-1">${lowStockCount} items</p>
                    </div>
                </div>

                <!-- Visual Charts (CSS based bars for simplicity without heavy libs) -->
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h3 class="font-bold text-gray-800 mb-6">Desglose de Gastos (Simulado)</h3>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-sm font-bold text-gray-600 mb-1">
                                <span>Proveedores</span>
                                <span>65%</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div class="bg-blue-500 h-full rounded-full" style="width: 65%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm font-bold text-gray-600 mb-1">
                                <span>Logística</span>
                                <span>20%</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div class="bg-purple-500 h-full rounded-full" style="width: 20%"></div>
                            </div>
                        </div>
                         <div>
                            <div class="flex justify-between text-sm font-bold text-gray-600 mb-1">
                                <span>Mermas</span>
                                <span>15%</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div class="bg-red-400 h-full rounded-full" style="width: 15%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    render();
};
