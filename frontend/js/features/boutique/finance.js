import { store } from '../../store.js';

export const renderFinance = (container) => {

    // Initial state for editing
    let editingId = null;

    const render = () => {
        const state = store.getState();
        const transactions = state.transactions || [];
        const summary = store.getFinancialSummary();

        // Calculate percentages for visual bar
        const total = summary.totalIncome + summary.totalExpenses;
        const incomePct = total > 0 ? (summary.totalIncome / total) * 100 : 0;
        const expensePct = total > 0 ? (summary.totalExpenses / total) * 100 : 0;

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

                <!-- Visual Report -->
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4 text-sm uppercase">Balance Visual</h3>
                    <div class="flex h-4 rounded-full overflow-hidden bg-gray-100">
                        <div class="bg-emerald-500 h-full transition-all duration-500 relative group" style="width: ${incomePct}%">
                        </div>
                        <div class="bg-red-500 h-full transition-all duration-500 relative group" style="width: ${expensePct}%">
                        </div>
                    </div>
                    <div class="flex justify-between mt-2 text-xs font-bold text-gray-500">
                        <span class="text-emerald-600">Ingresos ${incomePct.toFixed(0)}%</span>
                        <span class="text-red-500">Gastos ${expensePct.toFixed(0)}%</span>
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
                             <div class="p-4 flex justify-between items-center hover:bg-gray-50 group">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}">
                                        <i data-lucide="${t.type === 'income' ? 'dollar-sign' : 'shopping-bag'}" width="20"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold text-gray-800 text-sm">${t.category || t.categoria || 'Sin Categoría'}</p>
                                        <p class="text-xs text-gray-400">${t.description || t.date}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}">
                                        ${t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}€
                                    </span>
                                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button class="text-blue-500 hover:bg-blue-50 p-1 rounded edit-tx" data-id="${t.id}">
                                            <i data-lucide="edit-2" width="14"></i>
                                        </button>
                                        <button class="text-red-500 hover:bg-red-50 p-1 rounded delete-tx" data-id="${t.id}">
                                            <i data-lucide="trash" width="14"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<p class="p-8 text-center text-gray-400">No hay movimientos.</p>'}
                    </div>
                </div>
            </div>

             <!-- Modal -->
             <div id="txModal" class="fixed inset-0 z-50 bg-black/60 hidden backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-md p-6">
                     <h3 class="text-xl font-bold text-gray-800 mb-6" id="modalTitle">${editingId ? 'Editar Movimiento' : 'Registrar'}</h3>
                     <form id="txForm" class="space-y-4">
                         <div class="flex p-1 bg-gray-100 rounded-xl mb-4">
                            <button type="button" class="flex-1 py-2 rounded-lg font-bold bg-white text-red-500 shadow-sm" id="btnExpense">Gasto</button>
                            <button type="button" class="flex-1 py-2 rounded-lg font-bold text-gray-400" id="btnIncome">Ingreso</button>
                         </div>
                         <input type="hidden" name="type" id="txType" value="expense">
                         <input type="hidden" name="id" id="txId">
                         
                         <input type="number" name="amount" id="txAmount" step="0.01" class="w-full text-3xl font-bold p-4 border rounded-xl" placeholder="0.00 €" required>
                         <input type="text" name="category" id="txCategory" class="w-full p-3 border rounded-xl" placeholder="Categoría (ej. Luz, Material)" required>
                         <input type="text" name="description" id="txDescription" class="w-full p-3 border rounded-xl" placeholder="Descripción">
                         
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
            editingId = null;
            document.getElementById('modalTitle').textContent = 'Registrar';
            form.reset();
            setType('expense'); // Default
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });

        document.getElementById('closeTxModal').addEventListener('click', () => {
            editingId = null;
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
                btnExpense.className = "flex-1 py-2 rounded-lg font-bold bg-white text-red-500 shadow-sm transition-all";
                btnIncome.className = "flex-1 py-2 rounded-lg font-bold text-gray-400 hover:text-gray-600 transition-all";
            } else {
                btnIncome.className = "flex-1 py-2 rounded-lg font-bold bg-white text-emerald-500 shadow-sm transition-all";
                btnExpense.className = "flex-1 py-2 rounded-lg font-bold text-gray-400 hover:text-gray-600 transition-all";
            }
        };

        btnExpense.addEventListener('click', () => setType('expense'));
        btnIncome.addEventListener('click', () => setType('income'));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                description: formData.get('description'),
                date: new Date().toISOString().split('T')[0]
            };

            const state = store.getState();

            if (editingId) {
                const idx = state.transactions.findIndex(t => t.id === editingId);
                if (idx !== -1) {
                    state.transactions[idx] = { ...state.transactions[idx], ...data };
                    store.saveState();
                }
                editingId = null;
            } else {
                store.addTransaction(data);
            }

            render();
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        document.querySelectorAll('.delete-tx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                if (confirm('¿Eliminar movimiento?')) {
                    const state = store.getState();
                    state.transactions = state.transactions.filter(t => t.id !== id);
                    store.saveState();
                    render();
                }
            });
        });

        document.querySelectorAll('.edit-tx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const t = transactions.find(tx => tx.id === id);
                if (t) {
                    editingId = id;
                    document.getElementById('modalTitle').textContent = 'Editar Movimiento';
                    document.getElementById('txId').value = t.id;
                    document.getElementById('txAmount').value = t.amount;
                    document.getElementById('txCategory').value = t.category || t.categoria;
                    document.getElementById('txDescription').value = t.description || '';
                    setType(t.type);

                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
            });
        });
    };

    render();
};
