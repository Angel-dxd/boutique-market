import { api } from '../core/api.js';

export const renderRendimiento = async (container) => {
    container.innerHTML = `
        <div class="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Rendimiento</h1>
                    <p class="text-gray-500 font-medium text-sm md:text-base">Gestión de ingresos y gastos</p>
                </div>
                <button id="btnNewTransaction" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Nueva Transacción
                </button>
            </header>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 class="text-lg font-bold text-gray-800">Historial Financiero</h2>
                    <select id="filterType" class="w-full md:w-auto p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-600">
                        <option value="all">Todas las transacciones</option>
                        <option value="income">Solo Ingresos</option>
                        <option value="expense">Solo Gastos</option>
                    </select>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                <th class="p-4 font-bold border-b border-gray-100">Fecha</th>
                                <th class="p-4 font-bold border-b border-gray-100">Concepto</th>
                                <th class="p-4 font-bold border-b border-gray-100">Categoría</th>
                                <th class="p-4 font-bold border-b border-gray-100 text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody id="transactionList" class="divide-y divide-gray-50">
                            <tr>
                                <td colspan="4" class="p-8 text-center text-gray-400">
                                    <i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500"></i>
                                    Cargando transacciones...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal Nueva Transacción -->
        <div id="transactionModal" class="fixed inset-0 z-50 bg-gray-900/50 hidden items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-95 opacity-0" id="transactionModalBody">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 class="text-xl font-black text-gray-800">Nueva Transacción</h3>
                    <button id="closeTransactionModal" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <form id="transactionForm" class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <button type="button" id="btnIncome" class="p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-bold transition-all text-center">Ingreso</button>
                        <button type="button" id="btnExpense" class="p-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold transition-all text-center">Gasto</button>
                    </div>
                    <input type="hidden" id="transType" value="income">
                    
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Importe (€)</label>
                        <input type="number" step="0.01" id="transAmount" required class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-bold" placeholder="0.00">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
                        <select id="transCategory" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="Ventas">Ventas</option>
                            <option value="Servicios">Servicios</option>
                            <option value="Suministros">Suministros</option>
                            <option value="Despensa">Despensa</option>
                            <option value="Transporte">Transporte</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Concepto / Descripción</label>
                        <input type="text" id="transDesc" required class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Compra supermercado">
                    </div>

                    <button type="submit" class="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all mt-4">Guardar Transacción</button>
                </form>
            </div>
        </div>
    `;
    lucide.createIcons();

    let allTransactions = [];

    const loadData = async () => {
        const response = await api.get('/finance');
        allTransactions = response.error ? [] : (response.data || response);
        renderTable();
    };

    const renderTable = () => {
        const tbody = document.getElementById('transactionList');
        const filter = document.getElementById('filterType').value;
        
        let filtered = allTransactions;
        if (filter !== 'all') {
            filtered = filtered.filter(t => t.type === filter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-400 font-medium">No hay transacciones registradas</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(t => {
            const isIncome = t.type === 'income';
            const color = isIncome ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50';
            const sign = isIncome ? '+' : '-';
            const dateStr = new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return `
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="p-4 text-sm text-gray-500 whitespace-nowrap">${dateStr}</td>
                    <td class="p-4 font-medium text-gray-800">${t.description || t.category || 'Sin concepto'}</td>
                    <td class="p-4">
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">${t.category || 'General'}</span>
                    </td>
                    <td class="p-4 text-right font-black ${isIncome ? 'text-emerald-600' : 'text-red-500'} whitespace-nowrap">
                        ${sign}${parseFloat(t.amount).toFixed(2)}€
                    </td>
                </tr>
            `;
        }).join('');
    };

    document.getElementById('filterType').addEventListener('change', renderTable);

    // Modal logic
    const modal = document.getElementById('transactionModal');
    const modalBody = document.getElementById('transactionModalBody');
    const btnIncome = document.getElementById('btnIncome');
    const btnExpense = document.getElementById('btnExpense');
    const typeInput = document.getElementById('transType');

    const openModal = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modalBody.classList.remove('scale-95', 'opacity-0');
            modalBody.classList.add('scale-100', 'opacity-100');
        }, 10);
    };

    const closeModal = () => {
        modalBody.classList.remove('scale-100', 'opacity-100');
        modalBody.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 200);
    };

    document.getElementById('btnNewTransaction').addEventListener('click', openModal);
    document.getElementById('closeTransactionModal').addEventListener('click', closeModal);

    btnIncome.addEventListener('click', () => {
        typeInput.value = 'income';
        btnIncome.className = 'p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-bold transition-all text-center';
        btnExpense.className = 'p-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold transition-all text-center';
    });

    btnExpense.addEventListener('click', () => {
        typeInput.value = 'expense';
        btnExpense.className = 'p-3 rounded-xl border-2 border-red-500 bg-red-50 text-red-700 font-bold transition-all text-center';
        btnIncome.className = 'p-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold transition-all text-center';
    });

    document.getElementById('transactionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            type: typeInput.value,
            amount: document.getElementById('transAmount').value,
            category: document.getElementById('transCategory').value,
            description: document.getElementById('transDesc').value
        };
        
        await api.post('/finance', payload);
        e.target.reset();
        closeModal();
        loadData();
    });

    loadData();
};
