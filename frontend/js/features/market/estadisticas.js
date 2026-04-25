import { api } from '../core/api.js';

export const renderEstadisticas = async (container) => {
    let products = [];
    let invoices = [];
    let calcResult = null;

    const loadData = async () => {
        const [prodRes, invRes] = await Promise.all([
            api.get('/products'),
            api.get('/invoices')
        ]);
        products = prodRes.error ? [] : (prodRes.data || prodRes);
        invoices = invRes.error ? [] : (invRes.data || invRes);
    };

    const safeRender = () => {
        // ── Métricas reales ────────────────────────────────────────────────────
        const totalDebt = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
        const totalStockValue = products.reduce((sum, p) => sum + (parseFloat(p.price || 0) * parseInt(p.stock || 0)), 0);
        const totalCostValue = products.reduce((sum, p) => sum + (parseFloat(p.cost || 0) * parseInt(p.stock || 0)), 0);
        const potentialMargin = totalStockValue - totalCostValue;
        const lowStock = products.filter(p => parseInt(p.stock) <= parseInt(p.min_stock) && parseInt(p.stock) > 0);
        const outOfStock = products.filter(p => parseInt(p.stock) === 0);

        // ── Salud financiera ───────────────────────────────────────────────────
        let healthColor = 'bg-yellow-100 text-yellow-700';
        let healthLabel = 'Regular';
        let healthIcon = 'minus-circle';
        if (totalDebt === 0 && lowStock.length === 0 && outOfStock.length === 0) {
            healthColor = 'bg-emerald-100 text-emerald-700';
            healthLabel = 'Excelente';
            healthIcon = 'check-circle';
        } else if (totalDebt > 1000 || outOfStock.length > 3 || lowStock.length > 5) {
            healthColor = 'bg-red-100 text-red-700';
            healthLabel = 'Atención requerida';
            healthIcon = 'alert-circle';
        }

        // ── Top productos por valor de stock ───────────────────────────────────
        const topProducts = [...products]
            .map(p => ({ ...p, stockValue: parseFloat(p.price || 0) * parseInt(p.stock || 0) }))
            .sort((a, b) => b.stockValue - a.stockValue)
            .slice(0, 5);

        const maxStockValue = topProducts[0]?.stockValue || 1;

        // ── Calculadora de márgenes ────────────────────────────────────────────
        const calcHtml = calcResult ? `
            <div class="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3">
                <h4 class="font-black text-indigo-800 text-sm uppercase tracking-wide">Resultado del lote</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p class="text-xs text-indigo-400 font-bold uppercase">Coste total</p>
                        <p class="text-xl font-black text-indigo-700">${calcResult.totalCost.toFixed(2)}€</p>
                    </div>
                    <div>
                        <p class="text-xs text-indigo-400 font-bold uppercase">Ingreso total</p>
                        <p class="text-xl font-black text-indigo-700">${calcResult.totalRevenue.toFixed(2)}€</p>
                    </div>
                    <div>
                        <p class="text-xs text-indigo-400 font-bold uppercase">Beneficio neto</p>
                        <p class="text-xl font-black ${calcResult.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}">${calcResult.netProfit >= 0 ? '+' : ''}${calcResult.netProfit.toFixed(2)}€</p>
                    </div>
                    <div>
                        <p class="text-xs text-indigo-400 font-bold uppercase">Margen</p>
                        <p class="text-xl font-black ${calcResult.margin >= 20 ? 'text-emerald-600' : calcResult.margin >= 5 ? 'text-amber-500' : 'text-red-500'}">${calcResult.margin.toFixed(1)}%</p>
                    </div>
                </div>
                ${calcResult.ivaIncluded ? `
                <p class="text-xs text-indigo-400 text-center">
                    IVA (21%) incluido: coste sin IVA = ${calcResult.costWithoutIva.toFixed(2)}€ · 
                    precio sin IVA = ${calcResult.priceWithoutIva.toFixed(2)}€
                </p>` : ''}
            </div>` : '';

        container.innerHTML = `
            <div class="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
                <div>
                    <h1 class="text-xl md:text-3xl font-black text-gray-800">Estadísticas</h1>
                    <p class="text-gray-400 font-medium mt-1 text-sm">Análisis financiero · El Gallo Azul</p>
                </div>

                <!-- KPIs -->
                <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Salud financiera</p>
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm ${healthColor}">
                            <i data-lucide="${healthIcon}" width="14"></i>
                            ${healthLabel}
                        </div>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Deuda en facturas</p>
                        <p class="text-xl md:text-2xl font-black text-gray-800 mt-1">${totalDebt.toFixed(2)}€</p>
                        <p class="text-xs text-gray-400 mt-1">${invoices.length} facturas registradas</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Valor stock (venta)</p>
                        <p class="text-xl md:text-2xl font-black text-gray-800 mt-1">${totalStockValue.toFixed(2)}€</p>
                        <p class="text-xs text-emerald-500 font-bold mt-1">Margen potencial: +${potentialMargin.toFixed(2)}€</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Alertas de stock</p>
                        <p class="text-xl md:text-2xl font-black ${(lowStock.length + outOfStock.length) > 0 ? 'text-red-500' : 'text-gray-800'} mt-1">
                            ${lowStock.length + outOfStock.length}
                        </p>
                        <p class="text-xs text-gray-400 mt-1">${outOfStock.length} sin stock · ${lowStock.length} bajo mínimo</p>
                    </div>
                </div>

                <!-- Top productos + Calculadora -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <!-- Top productos por valor -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 class="font-black text-gray-800 mb-6">Top productos por valor de stock</h3>
                        ${topProducts.length === 0
                ? `<p class="text-gray-400 text-sm text-center py-8">Sin productos registrados.</p>`
                : topProducts.map((p, i) => {
                    const pct = (p.stockValue / maxStockValue) * 100;
                    const colors = ['bg-indigo-500', 'bg-blue-400', 'bg-purple-400', 'bg-sky-400', 'bg-teal-400'];
                    return `
                                <div class="mb-4">
                                    <div class="flex justify-between text-sm font-bold text-gray-700 mb-1.5">
                                        <span class="truncate max-w-[180px]">${i + 1}. ${p.title}</span>
                                        <span>${p.stockValue.toFixed(2)}€</span>
                                    </div>
                                    <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div class="${colors[i]} h-full rounded-full transition-all duration-700" style="width: ${pct}%"></div>
                                    </div>
                                    <p class="text-xs text-gray-400 mt-1">${p.stock} uds · ${parseFloat(p.price).toFixed(2)}€/ud</p>
                                </div>`;
                }).join('')}
                    </div>

                    <!-- Calculadora de márgenes por lote -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <i data-lucide="calculator" width="20"></i>
                            </div>
                            <div>
                                <h3 class="font-black text-gray-800">Calculadora de lote</h3>
                                <p class="text-xs text-gray-400">Coste, IVA y margen neto por cantidad</p>
                            </div>
                        </div>
                        <form id="calcForm" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Unidades</label>
                                    <input id="calcQty" type="number" min="1" value="10"
                                        class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Coste/ud (€)</label>
                                    <input id="calcCost" type="number" step="0.01" min="0" value=""
                                        class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        placeholder="0.00" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Precio venta/ud (€)</label>
                                    <input id="calcPrice" type="number" step="0.01" min="0" value=""
                                        class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        placeholder="0.00" />
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">IVA</label>
                                    <select id="calcIva"
                                        class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                        <option value="0">Sin IVA</option>
                                        <option value="4">4% (superreducido)</option>
                                        <option value="10">10% (reducido)</option>
                                        <option value="21" selected>21% (general)</option>
                                    </select>
                                </div>
                            </div>
                            <!-- Selector rápido de producto existente -->
                            ${products.length > 0 ? `
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">O selecciona un producto</label>
                                <select id="calcProduct"
                                    class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                    <option value="">Introducir manualmente</option>
                                    ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}" data-price="${p.price}">${p.title}</option>`).join('')}
                                </select>
                            </div>` : ''}
                            <button type="submit"
                                class="w-full py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                                Calcular margen
                            </button>
                        </form>
                        ${calcHtml}
                    </div>
                </div>

                <!-- Alertas de stock -->
                ${(lowStock.length + outOfStock.length) > 0 ? `
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-6 border-b border-gray-100">
                        <h3 class="font-black text-gray-800">Productos que requieren atención</h3>
                    </div>
                    <div class="divide-y divide-gray-50">
                        ${[...outOfStock, ...lowStock].map(p => {
                    const isOut = parseInt(p.stock) === 0;
                    return `
                            <div class="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p class="font-bold text-gray-800">${p.title}</p>
                                    <p class="text-xs text-gray-400">${p.category || 'General'}</p>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isOut ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">
                                        <span class="w-1.5 h-1.5 rounded-full ${isOut ? 'bg-red-500' : 'bg-amber-500'}"></span>
                                        ${isOut ? 'Sin stock' : `Stock bajo (${p.stock}/${p.min_stock})`}
                                    </span>
                                </div>
                            </div>`;
                }).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;

        lucide.createIcons();
        bindEvents();
    };

    const bindEvents = () => {
        // Rellenar campos al seleccionar producto existente
        document.getElementById('calcProduct')?.addEventListener('change', (e) => {
            const opt = e.target.options[e.target.selectedIndex];
            if (opt.value) {
                document.getElementById('calcCost').value = opt.getAttribute('data-cost') || '';
                document.getElementById('calcPrice').value = opt.getAttribute('data-price') || '';
            }
        });

        // Calcular margen
        document.getElementById('calcForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const qty = parseInt(document.getElementById('calcQty').value) || 1;
            const costPerUnit = parseFloat(document.getElementById('calcCost').value) || 0;
            const pricePerUnit = parseFloat(document.getElementById('calcPrice').value) || 0;
            const ivaRate = parseFloat(document.getElementById('calcIva').value) / 100;
            const ivaIncluded = ivaRate > 0;

            const totalCost = costPerUnit * qty * (1 + ivaRate);
            const totalRevenue = pricePerUnit * qty * (1 + ivaRate);
            const netProfit = totalRevenue - totalCost;
            const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

            calcResult = {
                totalCost,
                totalRevenue,
                netProfit,
                margin,
                ivaIncluded,
                costWithoutIva: costPerUnit * qty,
                priceWithoutIva: pricePerUnit * qty
            };
            safeRender();
        });
    };

    await loadData();
    safeRender();
};