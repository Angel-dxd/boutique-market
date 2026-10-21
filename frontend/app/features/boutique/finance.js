/**
 * boutique/finance.js
 * Módulo de gestión financiera para la Boutique.
 * Gestiona ingresos, gastos, KPIs mensuales y comparativas.
 */
import { api } from '../core/api.js';
import { showConfirm } from '../shared/modal.js';

/**
 * Renderiza la interfaz de finanzas.
 * @param {HTMLElement} container - El elemento donde se inyectará el HTML.
 */
export const renderFinance = async (container) => {
    let editingId = null;
    let transactions = [];
    let isModalOpen = false;
    let selectedMonth = new Date().getMonth();
    let selectedYear = new Date().getFullYear();

    const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const cachedFinanceKey = `cached_finance_${localStorage.getItem('currentUser') || 'default'}`;

    // Cargar datos cacheados primero (SWR)
    try {
        const cached = localStorage.getItem(cachedFinanceKey);
        if (cached) {
            transactions = JSON.parse(cached);
        }
    } catch (e) {
        console.error("Error al leer caché financiero", e);
    }

    const loadData = async () => {
        const res = await api.get('/finance');
        transactions = res.error ? [] : res;
        
        // Guardar en caché
        try {
            localStorage.setItem(cachedFinanceKey, JSON.stringify(transactions));
        } catch (e) {
            console.error("Error al guardar caché financiero", e);
        }
    };

    // Calcula resumen para un mes/año dado
    const calcSummary = (month, year) => {
        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        let income = 0, expenses = 0;
        filtered.forEach(t => {
            const amt = parseFloat(t.amount || 0);
            if (['income', 'entrada'].includes(t.type)) income += amt;
            else expenses += amt;
        });
        return { income, expenses, net: income - expenses, count: filtered.length };
    };

    // Calcula resumen global (todos los registros)
    const calcGlobal = () => {
        let income = 0, expenses = 0;
        transactions.forEach(t => {
            const amt = parseFloat(t.amount || 0);
            if (['income', 'entrada'].includes(t.type)) income += amt;
            else expenses += amt;
        });
        return { income, expenses, net: income - expenses };
    };

    const safeRender = () => {
        const now = new Date();
        const curMonth = now.getMonth();
        const curYear = now.getFullYear();
        const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
        const prevYear = curMonth === 0 ? curYear - 1 : curYear;

        const thisMo = calcSummary(curMonth, curYear);
        const lastMo = calcSummary(prevMonth, prevYear);
        const global = calcGlobal();

        // Variación respecto al mes anterior
        const incomeDiff = lastMo.income > 0
            ? (((thisMo.income - lastMo.income) / lastMo.income) * 100).toFixed(1)
            : null;
        const incomeDiffPositive = parseFloat(incomeDiff) >= 0;

        // Transacciones del mes seleccionado
        const monthTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });

        const total = thisMo.income + thisMo.expenses;
        const incomePct = total > 0 ? (thisMo.income / total) * 100 : 0;
        const expensePct = total > 0 ? (thisMo.expenses / total) * 100 : 0;

        container.innerHTML = `
            <div class="p-8 w-full max-w-7xl mx-auto space-y-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-black text-gray-800">Finanzas</h1>
                        <p class="text-gray-400 font-medium mt-1">Panel de control financiero · Oh-Nails</p>
                    </div>
                    <button id="addTxBtn"
                        class="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                        <i data-lucide="plus" width="18"></i> Registrar movimiento
                    </button>
                </div>

                <!-- KPIs globales -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Beneficio neto global</p>
                        <p class="text-3xl font-black mt-2 ${global.net >= 0 ? 'text-emerald-600' : 'text-red-500'}">
                            ${global.net >= 0 ? '+' : ''}${global.net.toFixed(2)}€
                        </p>
                        <p class="text-xs text-gray-400 mt-1">Acumulado total · ${transactions.length} movimientos</p>
                    </div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-xs font-bold uppercase tracking-wider text-emerald-500">Ingresos globales</p>
                        <p class="text-2xl font-black text-gray-800 mt-2">${global.income.toFixed(2)}€</p>
                    </div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-xs font-bold uppercase tracking-wider text-red-400">Gastos globales</p>
                        <p class="text-2xl font-black text-gray-800 mt-2">${global.expenses.toFixed(2)}€</p>
                    </div>
                </div>

                <!-- Comparativa mensual -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Este mes -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-black text-gray-800">${MONTHS[curMonth]} ${curYear}</h3>
                            <span class="text-xs font-bold px-3 py-1 rounded-full ${thisMo.net >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}">
                                ${thisMo.net >= 0 ? '+' : ''}${thisMo.net.toFixed(2)}€ neto
                            </span>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Ingresos
                                </div>
                                <span class="font-black text-emerald-600">${thisMo.income.toFixed(2)}€</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                    <span class="w-2 h-2 rounded-full bg-red-400"></span> Gastos
                                </div>
                                <span class="font-black text-red-500">${thisMo.expenses.toFixed(2)}€</span>
                            </div>
                        </div>
                        <!-- Barra visual -->
                        <div class="mt-4 flex h-2.5 rounded-full overflow-hidden bg-gray-100">
                            <div class="bg-emerald-500 h-full transition-all duration-500" style="width: ${incomePct}%"></div>
                            <div class="bg-red-400 h-full transition-all duration-500" style="width: ${expensePct}%"></div>
                        </div>
                        <div class="flex justify-between mt-1.5 text-xs font-bold text-gray-400">
                            <span class="text-emerald-500">${incomePct.toFixed(0)}% ingresos</span>
                            <span class="text-red-400">${expensePct.toFixed(0)}% gastos</span>
                        </div>
                    </div>

                    <!-- Mes anterior -->
                    <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-black text-gray-500">${MONTHS[prevMonth]} ${prevYear}</h3>
                            <span class="text-xs font-bold text-gray-400">Mes anterior</span>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400 font-medium">Ingresos</span>
                                <span class="font-black text-gray-600">${lastMo.income.toFixed(2)}€</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400 font-medium">Gastos</span>
                                <span class="font-black text-gray-500">${lastMo.expenses.toFixed(2)}€</span>
                            </div>
                            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span class="text-sm text-gray-400 font-medium">Neto</span>
                                <span class="font-black ${lastMo.net >= 0 ? 'text-emerald-600' : 'text-red-500'}">${lastMo.net >= 0 ? '+' : ''}${lastMo.net.toFixed(2)}€</span>
                            </div>
                        </div>
                        ${incomeDiff !== null ? `
                        <div class="mt-4 p-3 rounded-xl ${incomeDiffPositive ? 'bg-emerald-50' : 'bg-red-50'} flex items-center gap-2">
                            <i data-lucide="${incomeDiffPositive ? 'trending-up' : 'trending-down'}" width="16"
                                class="${incomeDiffPositive ? 'text-emerald-500' : 'text-red-500'}"></i>
                            <span class="text-xs font-bold ${incomeDiffPositive ? 'text-emerald-700' : 'text-red-700'}">
                                Ingresos ${incomeDiffPositive ? '+' : ''}${incomeDiff}% vs mes anterior
                            </span>
                        </div>` : `
                        <div class="mt-4 p-3 rounded-xl bg-gray-100 text-xs text-gray-400 font-medium">
                            Sin datos del mes anterior para comparar.
                        </div>`}
                    </div>
                </div>

                <!-- Filtro de mes + lista de transacciones -->
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                        <h3 class="font-black text-gray-800">Movimientos</h3>
                        <div class="flex items-center gap-2">
                            <button id="prevMonthBtn" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <i data-lucide="chevron-left" width="18"></i>
                            </button>
                            <span class="text-sm font-bold text-gray-700 min-w-[120px] text-center">
                                ${MONTHS[selectedMonth]} ${selectedYear}
                            </span>
                            <button id="nextMonthBtn" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <i data-lucide="chevron-right" width="18"></i>
                            </button>
                        </div>
                    </div>
                    <div class="divide-y divide-gray-50">
                        ${monthTx.length === 0
                ? `<p class="p-10 text-center text-gray-400 font-medium">No hay movimientos en ${MONTHS[selectedMonth]} ${selectedYear}.</p>`
                : monthTx.map(t => {
                    const isIncome = ['income', 'entrada'].includes(t.type);
                    return `
                                <div class="p-4 flex justify-between items-center hover:bg-gray-50 group transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2.5 rounded-xl ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}">
                                            <i data-lucide="${isIncome ? 'arrow-down-circle' : 'arrow-up-circle'}" width="18"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-800 text-sm">${t.category || 'Sin categoría'}</p>
                                            <p class="text-xs text-gray-400">${new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span class="font-black text-base ${isIncome ? 'text-emerald-600' : 'text-red-500'}">
                                            ${isIncome ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}€
                                        </span>
                                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button class="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg edit-tx" data-id="${t.id}">
                                                <i data-lucide="pencil" width="14"></i>
                                            </button>
                                            <button class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg delete-tx" data-id="${t.id}">
                                                <i data-lucide="trash-2" width="14"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>`;
                }).join('')}
                    </div>
                </div>
            </div>

            <!-- Modal -->
            ${isModalOpen ? `
            <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                    <div class="p-8 border-b border-gray-100 flex items-center justify-between">
                        <h2 class="text-xl font-black text-gray-800">${editingId ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
                        <button id="closeModal" class="p-2 hover:bg-gray-100 rounded-xl"><i data-lucide="x" width="20"></i></button>
                    </div>
                    <form id="txForm" class="p-8 space-y-4">
                        <!-- Tipo -->
                        <div class="flex p-1 bg-gray-100 rounded-xl">
                            <button type="button" id="btnExpense"
                                class="flex-1 py-2.5 rounded-lg font-bold bg-white text-red-500 shadow-sm transition-all">
                                Gasto
                            </button>
                            <button type="button" id="btnIncome"
                                class="flex-1 py-2.5 rounded-lg font-bold text-gray-400 transition-all">
                                Ingreso
                            </button>
                        </div>
                        <input type="hidden" name="type" id="txType" value="expense">

                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Importe (€) *</label>
                            <input type="number" name="amount" id="txAmount" step="0.01" min="0" required
                                class="w-full text-2xl font-black p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                                placeholder="0.00" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Categoría *</label>
                            <input type="text" name="category" id="txCategory" required
                                class="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                                placeholder="Ej: Material, Luz, Nómina..." />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
                            <input type="date" name="date" id="txDate"
                                class="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                                value="${new Date().toISOString().split('T')[0]}" />
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" id="cancelBtn"
                                class="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">
                                ${editingId ? 'Guardar cambios' : 'Registrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>` : ''}
        `;

        lucide.createIcons();
        bindEvents();
    };

    const bindEvents = () => {
        // Abrir modal nuevo
        document.getElementById('addTxBtn')?.addEventListener('click', () => {
            editingId = null;
            isModalOpen = true;
            safeRender();
        });

        document.getElementById('closeModal')?.addEventListener('click', () => {
            isModalOpen = false;
            editingId = null;
            safeRender();
        });
        document.getElementById('cancelBtn')?.addEventListener('click', () => {
            isModalOpen = false;
            editingId = null;
            safeRender();
        });

        // Navegación de meses
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
            if (selectedMonth === 0) { selectedMonth = 11; selectedYear--; }
            else selectedMonth--;
            safeRender();
        });
        document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
            if (selectedMonth === 11) { selectedMonth = 0; selectedYear++; }
            else selectedMonth++;
            safeRender();
        });

        // Toggle tipo gasto/ingreso
        const setType = (type) => {
            document.getElementById('txType').value = type;
            const isExpense = type === 'expense';
            document.getElementById('btnExpense').className = `flex-1 py-2.5 rounded-lg font-bold transition-all ${isExpense ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`;
            document.getElementById('btnIncome').className = `flex-1 py-2.5 rounded-lg font-bold transition-all ${!isExpense ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`;
        };
        document.getElementById('btnExpense')?.addEventListener('click', () => setType('expense'));
        document.getElementById('btnIncome')?.addEventListener('click', () => setType('income'));

        // Editar
        document.querySelectorAll('.edit-tx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const t = transactions.find(tx => tx.id === parseInt(btn.getAttribute('data-id')));
                if (!t) return;
                editingId = t.id;
                isModalOpen = true;
                safeRender();
                setTimeout(() => {
                    document.getElementById('txAmount').value = t.amount;
                    document.getElementById('txCategory').value = t.category || '';
                    document.getElementById('txDate').value = new Date(t.date).toISOString().split('T')[0];
                    const setTypeFn = (type) => {
                        document.getElementById('txType').value = type;
                        const isExpense = type === 'expense';
                        document.getElementById('btnExpense').className = `flex-1 py-2.5 rounded-lg font-bold transition-all ${isExpense ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`;
                        document.getElementById('btnIncome').className = `flex-1 py-2.5 rounded-lg font-bold transition-all ${!isExpense ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`;
                    };
                    setTypeFn(t.type);
                }, 0);
            });
        });

        // Eliminar
        document.querySelectorAll('.delete-tx').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmed = await showConfirm(
                    'Eliminar Movimiento',
                    '¿Eliminar este movimiento? Esta acción no se puede deshacer.',
                    'Sí, eliminar',
                    'Cancelar'
                );
                if (!confirmed) return;
                const res = await api.delete(`/finance/${btn.getAttribute('data-id')}`);
                if (!res.error) { await loadData(); safeRender(); }
                else { api.showToast('Error al eliminar el movimiento.', true); }
            });
        });

        // Submit
        document.getElementById('txForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const payload = {
                type: fd.get('type'),
                amount: parseFloat(fd.get('amount')),
                category: fd.get('category'),
                date: fd.get('date') || new Date().toISOString().split('T')[0]
            };
            const res = editingId
                ? await api.put(`/finance/${editingId}`, payload)
                : await api.post('/finance', payload);
            if (!res.error) {
                isModalOpen = false;
                editingId = null;
                await loadData();
                safeRender();
            } else {
                api.showToast('Error al guardar el movimiento.', true);
            }
        });
    };

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="p-8 w-full max-w-7xl mx-auto space-y-8 animate-pulse">
                <div class="flex items-center justify-between">
                    <div class="h-8 bg-gray-250 rounded-xl w-48"></div>
                    <div class="h-10 bg-gray-250 rounded-xl w-36"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white h-28 rounded-3xl border border-gray-100"></div>
                    <div class="bg-white h-28 rounded-3xl border border-gray-100"></div>
                    <div class="bg-white h-28 rounded-3xl border border-gray-100"></div>
                </div>
                <div class="bg-white h-96 rounded-3xl border border-gray-100"></div>
            </div>
        `;
    } else {
        safeRender();
    }

    await loadData();
    safeRender();
};