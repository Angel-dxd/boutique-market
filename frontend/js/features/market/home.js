import { store } from '../../store.js';
import { navigateTo } from '../../app.js';

export const renderMarketHome = (container) => {
    const render = () => {
        const state = store.getState();
        const products = state.products || [];
        const invoices = state.invoices || [];
        const suppliers = state.suppliers || [];

        // KPIs
        const criticalStock = products.filter(p => parseInt(p.stock) <= parseInt(p.min_stock)).length;
        const pendingInvoices = invoices.length;
        const totalDebt = invoices.reduce((acc, inv) => acc + parseFloat(inv.monto || 0), 0);
        const activeSuppliers = suppliers.length;

        container.innerHTML = `
            <div class="p-8 w-full max-w-7xl mx-auto space-y-10">
                <header>
                    <h1 class="text-4xl font-black text-gray-800 tracking-tight">Market Dashboard</h1>
                    <p class="text-gray-500 font-medium">Resumen general de El Gallo Azul</p>
                </header>

                <!-- KPIs -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Stock Crítico -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-lg transition-all cursor-pointer" onclick="window.navigateTo('/market/inventario')">
                        <div>
                            <p class="text-gray-400 font-bold uppercase text-xs tracking-wider">Stock Crítico</p>
                            <h2 class="text-4xl font-black ${criticalStock > 0 ? 'text-red-500' : 'text-emerald-500'} mt-2">${criticalStock}</h2>
                            <p class="text-xs text-gray-400 mt-1">Productos bajo mínimo</p>
                        </div>
                        <div class="p-4 rounded-2xl ${criticalStock > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}">
                            <i data-lucide="alert-triangle" width="32"></i>
                        </div>
                    </div>

                    <!-- Facturas Pendientes -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-lg transition-all cursor-pointer" onclick="window.navigateTo('/market/pedidos')">
                        <div>
                            <p class="text-gray-400 font-bold uppercase text-xs tracking-wider">Facturas Pendientes</p>
                            <h2 class="text-4xl font-black text-blue-600 mt-2">${pendingInvoices}</h2>
                            <p class="text-xs text-gray-400 mt-1">Total: ${totalDebt.toFixed(2)}€</p>
                        </div>
                        <div class="p-4 rounded-2xl bg-blue-50 text-blue-600">
                            <i data-lucide="file-text" width="32"></i>
                        </div>
                    </div>

                    <!-- Proveedores Activos -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-lg transition-all cursor-pointer" onclick="window.navigateTo('/market/proveedores')">
                        <div>
                            <p class="text-gray-400 font-bold uppercase text-xs tracking-wider">Proveedores</p>
                            <h2 class="text-4xl font-black text-purple-600 mt-2">${activeSuppliers}</h2>
                            <p class="text-xs text-gray-400 mt-1">Registrados</p>
                        </div>
                        <div class="p-4 rounded-2xl bg-purple-50 text-purple-600">
                            <i data-lucide="users" width="32"></i>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-6">Acciones Rápidas</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button id="btnInv" class="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                            <div class="p-4 bg-emerald-100 text-emerald-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                                <i data-lucide="package" width="32"></i>
                            </div>
                            <h4 class="text-xl font-black text-gray-800">Inventario</h4>
                            <p class="text-sm text-gray-500 mt-1">Gestionar stock y productos</p>
                        </button>

                        <button id="btnOrders" class="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                            <div class="p-4 bg-blue-100 text-blue-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                                <i data-lucide="shopping-cart" width="32"></i>
                            </div>
                            <h4 class="text-xl font-black text-gray-800">Pedidos</h4>
                            <p class="text-sm text-gray-500 mt-1">Registrar facturas y compras</p>
                        </button>

                        <button id="btnCalc" class="p-8 bg-[#1e293b] text-white rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left group relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-12 opacity-10">
                                <i data-lucide="calculator" width="120"></i>
                            </div>
                            <div class="p-4 bg-gray-700/50 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                                <i data-lucide="calculator" width="32"></i>
                            </div>
                            <h4 class="text-xl font-black">Calculadora</h4>
                            <p class="text-sm text-gray-400 mt-1">Herramienta rápida</p>
                        </button>
                    </div>
                </div>
                
                <!-- Simple Calculator Modal -->
                <div id="calcModal" class="fixed inset-0 z-50 bg-black/60 hidden items-center justify-center p-4 backdrop-blur-sm">
                    <div class="bg-gray-900 p-6 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-800">
                        <div class="flex justify-between items-center mb-4 text-white">
                            <span class="font-bold">Calculadora</span>
                            <button id="closeCalc"><i data-lucide="x"></i></button>
                        </div>
                        <input id="calcDisplay" class="w-full bg-black/50 text-right text-4xl text-white p-4 rounded-xl mb-4 font-mono tracking-widest outline-none border border-gray-800" readonly value="0" />
                        <div class="grid grid-cols-4 gap-2">
                            ${['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map(k => {
            const isOp = ['÷', '×', '-', '+', '='].includes(k);
            const isAction = ['C', '⌫'].includes(k);
            const colSpan = k === '0' ? 'col-span-2' : '';
            const bg = isOp ? 'bg-orange-500 text-white' : isAction ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-200';
            return `<button class="${colSpan} ${bg} p-4 rounded-xl font-bold text-xl active:scale-95 transition-transform calc-btn" data-val="${k}">${k}</button>`;
        }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        // Bind Actions
        document.getElementById('btnInv').addEventListener('click', () => navigateTo('/market/inventario'));
        document.getElementById('btnOrders').addEventListener('click', () => navigateTo('/market/pedidos'));

        // Calculator Logic
        const calcModal = document.getElementById('calcModal');
        const display = document.getElementById('calcDisplay');
        let currentExp = '';

        document.getElementById('btnCalc').addEventListener('click', () => {
            calcModal.classList.remove('hidden');
            calcModal.classList.add('flex');
        });

        document.getElementById('closeCalc').addEventListener('click', () => {
            calcModal.classList.add('hidden');
            calcModal.classList.remove('flex');
            currentExp = '';
            display.value = '0';
        });

        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                if (val === 'C') {
                    currentExp = '';
                    display.value = '0';
                } else if (val === '⌫') {
                    currentExp = currentExp.slice(0, -1);
                    display.value = currentExp || '0';
                } else if (val === '=') {
                    try {
                        // Safe eval equivalent
                        const safeExp = currentExp.replace('×', '*').replace('÷', '/');
                        display.value = eval(safeExp) || 0; // Keeping it simple for vanilla JS demo
                        currentExp = display.value;
                    } catch {
                        display.value = 'Error';
                        currentExp = '';
                    }
                } else {
                    if (val === '.' && currentExp.includes('.') && !['+', '-', '×', '÷'].some(op => currentExp.includes(op))) return; // simple check
                    currentExp += val;
                    display.value = currentExp;
                }
            });
        });

        // Hack for global navigation from onclick
        window.navigateTo = navigateTo;
    };
    render();
};
