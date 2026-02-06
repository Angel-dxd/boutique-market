import { store } from '../../store.js';

export const renderFinance = (container) => {

    const render = () => {
        const state = store.getState();
        const transactions = state.transactions;
        const summary = store.getFinancialSummary();

        container.innerHTML = `
            <div class="space-y-6 pb-24 md:pb-0">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Finanzas <span class="text-sm font-normal text-gray-400">| Panel de Control</span>
                    </h2>
                     <div class="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        LOCAL STORE
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p class="text-gray-500 text-xs font-bold uppercase">Beneficio Neto</p>
                        <p class="text-3xl font-bold ${summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}">
                            ${summary.netProfit.toFixed(2)}€
                        </p>
                    </div>
                    <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p class="text-emerald-600 text-xs font-bold uppercase">Ingresos</p>
                        <p class="text-xl font-bold text-gray-800">${summary.totalIncome.toFixed(2)}€</p>
                    </div>
                     <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p class="text-red-500 text-xs font-bold uppercase">Gastos</p>
                        <p class="text-xl font-bold text-gray-800">${summary.totalExpenses.toFixed(2)}€</p>
                    </div>
                </div>

                <!-- Action Button -->
                <button id="addTxBtn" class="w-full md:w-auto px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                    Registrar Movimiento
                </button>

                 <!-- Transactions List -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="divide-y divide-gray-100">
                        ${transactions.length > 0 ? transactions.map(t => `
                             <div class="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}">
                                        <i data-lucide="${t.type === 'income' ? 'dollar-sign' : 'shopping-bag'}" width="20"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold text-gray-800 text-sm">${t.category || t.categoria || 'Sin Categoría'}</p>
                                        <p class="text-xs text-gray-400">${t.description || t.date}</p>
                                    </div>
                                </div>
                                <span class="font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}">
                                    ${t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}€
                                </span>
                            </div>
                        `).join('') : '<p class="p-8 text-center text-gray-400">No hay movimientos.</p>'}
                    </div>
                </div>
            </div>

             <!-- Modal -->
             <div id="txModal" class="fixed inset-0 z-50 bg-black/60 hidden backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-md p-6">
                     <h3 class="text-xl font-bold text-gray-800 mb-6">Registrar</h3>
                     <form id="txForm" class="space-y-4">
                         <div class="flex p-1 bg-gray-100 rounded-xl mb-4">
                            <button type="button" class="flex-1 py-2 rounded-lg font-bold bg-white text-red-500 shadow-sm" id="btnExpense">Gasto</button>
                            <button type="button" class="flex-1 py-2 rounded-lg font-bold text-gray-400" id="btnIncome">Ingreso</button>
                         </div>
                         <input type="hidden" name="type" id="txType" value="expense">
                         
                         <input type="number" name="amount" step="0.01" class="w-full text-3xl font-bold p-4 border rounded-xl" placeholder="0.00 €" required>
                         <input type="text" name="category" class="w-full p-3 border rounded-xl" placeholder="Categoría (ej. Luz, Material)" required>
                         <input type="text" name="description" class="w-full p-3 border rounded-xl" placeholder="Descripción">
                         
                         <div class="flex gap-3">
                            <button type="button" id="closeTxModal" class="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancelar</button>
                            <button type="submit" class="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold">Guardar</button>
                         </div>
                     </form>
                </div>
             </div>
        `;

        lucide.createIcons();

        // Modal Logic
        const modal = document.getElementById('txModal');
        const form = document.getElementById('txForm');

        document.getElementById('addTxBtn').addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });

        document.getElementById('closeTxModal').addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        // Toggle Type Logic
        const btnExpense = document.getElementById('btnExpense');
        const btnIncome = document.getElementById('btnIncome');
        const txType = document.getElementById('txType');

        const setType = (type) => {
            txType.value = type;
            if (type === 'expense') {
                btnExpense.className = "flex-1 py-2 rounded-lg font-bold bg-white text-red-500 shadow-sm";
                btnIncome.className = "flex-1 py-2 rounded-lg font-bold text-gray-400";
            } else {
                btnIncome.className = "flex-1 py-2 rounded-lg font-bold bg-white text-emerald-500 shadow-sm";
                btnExpense.className = "flex-1 py-2 rounded-lg font-bold text-gray-400";
            }
        };

        btnExpense.addEventListener('click', () => setType('expense'));
        btnIncome.addEventListener('click', () => setType('income'));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            store.addTransaction({
                type: formData.get('type'),
                amount: formData.get('amount'),
                category: formData.get('category'),
                description: formData.get('description'),
                date: new Date().toISOString().split('T')[0]
            });
            render();
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    };

    render();
};
