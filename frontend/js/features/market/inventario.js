/**
 * market/inventario.js
 * Módulo de gestión de inventario para El Gallo Azul.
 * Gestiona el listado de productos, control de stock y precios.
 */
import { api } from '../core/api.js';
import { showConfirm } from '../shared/modal.js';

/**
 * Renderiza la interfaz de inventario.
 * @param {HTMLElement} container - El elemento donde se inyectará el HTML.
 */
export const renderInventario = async (container) => {
    let products = [];
    let providers = [];
    let isModalOpen = false;
    let editingId = null;
    let currentPage = 1;
    let totalPages = 1;
    const limit = 10;

    const loadData = async () => {
        const [prodRes, provRes] = await Promise.all([
            api.get(`/products?page=${currentPage}&limit=${limit}`),
            api.get('/providers')
        ]);
        products = prodRes.error ? [] : (prodRes.data || prodRes);
        totalPages = prodRes.totalPages || 1;
        providers = provRes.error ? [] : provRes;
    };

    const getEditingProduct = () => products.find(p => p.id === editingId) || null;

    const getStatusStyle = (product) => {
        if (product.stock === 0) return { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700', label: 'Sin stock' };
        if (product.stock <= product.min_stock) return { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700', label: 'Stock bajo' };
        return { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', label: 'Disponible' };
    };

    const renderProviderOptions = (selectedId = null) =>
        providers.map(p =>
            `<option value="${p.id}" ${selectedId && p.id == selectedId ? 'selected' : ''}>${p.name} — ${p.company || 'Sin empresa'}</option>`
        ).join('');

    const safeRender = () => {
        const editing = getEditingProduct();
        const lowStockCount = products.filter(p => p.stock <= p.min_stock && p.stock > 0).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (p.stock * parseFloat(p.price || 0)), 0);

        container.innerHTML = `
            <div class="p-4 md:p-8 w-full max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-1 md:mb-2">
                    <h1 class="text-xl md:text-3xl font-black text-gray-800">Inventario</h1>
                    <button id="addProdBtn"
                        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                        <i data-lucide="plus" width="18"></i> Nuevo Producto
                    </button>
                </div>
                <p class="text-gray-400 font-medium mb-4 md:mb-8 text-sm">Stock y precios del Gallo Azul</p>

                <!-- KPIs -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10">
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Valor total stock</p>
                            <p class="text-xl md:text-3xl font-black text-gray-800 mt-1">${totalValue.toFixed(2)}€</p>
                        </div>
                        <div class="p-3 bg-indigo-50 text-indigo-500 rounded-2xl"><i data-lucide="package" width="24"></i></div>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Stock bajo</p>
                            <p class="text-xl md:text-3xl font-black text-amber-500 mt-1">${lowStockCount}</p>
                        </div>
                        <div class="p-3 bg-amber-50 text-amber-500 rounded-2xl"><i data-lucide="alert-triangle" width="24"></i></div>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Sin stock</p>
                            <p class="text-xl md:text-3xl font-black text-red-500 mt-1">${outOfStockCount}</p>
                        </div>
                        <div class="p-3 bg-red-50 text-red-500 rounded-2xl"><i data-lucide="x-circle" width="24"></i></div>
                    </div>
                </div>

                <!-- Tabla de productos -->
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="bg-gray-50 text-gray-400 uppercase text-xs tracking-wider">
                                    <th class="px-6 py-4 text-left font-bold">Producto</th>
                                    <th class="px-6 py-4 text-left font-bold">Categoría</th>
                                    <th class="px-6 py-4 text-right font-bold">Coste</th>
                                    <th class="px-6 py-4 text-right font-bold">Precio venta</th>
                                    <th class="px-6 py-4 text-right font-bold">Margen</th>
                                    <th class="px-6 py-4 text-center font-bold">Stock</th>
                                    <th class="px-6 py-4 text-center font-bold">Estado</th>
                                    <th class="px-6 py-4 text-center font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                ${products.length === 0
                ? `<tr><td colspan="8" class="text-center py-16 text-gray-400 font-medium">No hay productos registrados.</td></tr>`
                : products.map(p => {
                    const status = getStatusStyle(p);
                    const cost = parseFloat(p.cost || 0);
                    const price = parseFloat(p.price || 0);
                    const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : '—';
                    const marginColor = parseFloat(margin) > 30 ? 'text-emerald-600' : parseFloat(margin) > 10 ? 'text-amber-600' : 'text-red-500';
                    return `
                                        <tr class="hover:bg-gray-50 transition-colors group">
                                            <td class="px-6 py-4 font-semibold text-gray-800">${p.title}</td>
                                            <td class="px-6 py-4 text-gray-500">${p.category || 'General'}</td>
                                            <td class="px-6 py-4 text-right text-gray-500">${cost.toFixed(2)}€</td>
                                            <td class="px-6 py-4 text-right font-bold text-gray-800">${price.toFixed(2)}€</td>
                                            <td class="px-6 py-4 text-right font-bold ${marginColor}">${margin !== '—' ? margin + '%' : '—'}</td>
                                            <td class="px-6 py-4 text-center">
                                                <span class="font-bold text-gray-800">${p.stock}</span>
                                                <span class="text-gray-400 text-xs"> / mín ${p.min_stock}</span>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.badge}">
                                                    <span class="w-1.5 h-1.5 rounded-full ${status.dot}"></span>
                                                    ${status.label}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center justify-center gap-2">
                                                    <button data-edit="${p.id}"
                                                        class="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors" title="Editar">
                                                        <i data-lucide="pencil" width="16"></i>
                                                    </button>
                                                    <button data-delete="${p.id}"
                                                        class="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar">
                                                        <i data-lucide="trash-2" width="16"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>`;
                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Paginación -->
                    ${totalPages > 1 ? `
                    <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span class="text-sm text-gray-500">Página <span class="font-bold">${currentPage}</span> de ${totalPages}</span>
                        <div class="flex gap-2">
                            <button id="prevPageBtn" class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                            <button id="nextPageBtn" class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
                        </div>
                    </div>` : ''}
                </div>

                <!-- Modal crear / editar -->
                ${isModalOpen ? `
                <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
                        <div class="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 class="text-xl font-black text-gray-800">
                                ${editingId ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <button id="closeModal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <i data-lucide="x" width="20"></i>
                            </button>
                        </div>
                        <form id="prodForm" class="p-8 space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Nombre del producto *</label>
                                <input name="title" required value="${editing?.title || ''}"
                                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    placeholder="Ej: Pollo entero 2kg" />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Precio coste (€) *</label>
                                    <input name="cost" type="number" step="0.01" min="0" value="${editing?.cost || ''}"
                                        class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        placeholder="0.00" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Precio venta (€) *</label>
                                    <input name="price" type="number" step="0.01" min="0" required value="${editing?.price || ''}"
                                        class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        placeholder="0.00" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Stock actual</label>
                                    <input name="stock" type="number" min="0" value="${editing?.stock ?? 0}"
                                        class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Stock mínimo</label>
                                    <input name="min_stock" type="number" min="0" value="${editing?.min_stock ?? 5}"
                                        class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                                <input name="category" value="${editing?.category || 'General'}"
                                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    placeholder="Ej: Aves, Cerdo, Embutidos..." />
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Proveedor</label>
                                <select name="provider_id"
                                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                    <option value="">Sin proveedor asignado</option>
                                    ${renderProviderOptions(editing?.provider_id)}
                                </select>
                            </div>
                            <div class="pt-4 flex gap-3">
                                <button type="button" id="cancelBtn"
                                    class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    class="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                                    ${editingId ? 'Guardar cambios' : 'Crear producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>` : ''}
            </div>
        `;

        lucide.createIcons();
        bindEvents();
    };

    const bindEvents = () => {
        // Abrir modal nuevo
        document.getElementById('addProdBtn')?.addEventListener('click', () => {
            editingId = null;
            isModalOpen = true;
            safeRender();
        });

        // Cerrar modal
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

        // Botones editar
        document.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingId = parseInt(btn.getAttribute('data-edit'));
                isModalOpen = true;
                safeRender();
            });
        });

        // Botones eliminar
        document.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-delete'));
                const product = products.find(p => p.id === id);
                
                const confirmed = await showConfirm(
                    'Eliminar Producto',
                    `¿Estás seguro de eliminar "${product?.title}"? Esta acción no se puede deshacer.`,
                    'Sí, eliminar',
                    'Cancelar'
                );
                if (!confirmed) return;

                const res = await api.delete(`/products/${id}`);
                if (!res.error) {
                    await loadData();
                    safeRender();
                } else {
                    api.showToast('Error al eliminar el producto.', true);
                }
            });
        });

        // Submit formulario (crear o editar)
        document.getElementById('prodForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const payload = {
                title: formData.get('title'),
                price: parseFloat(formData.get('price')),
                cost: parseFloat(formData.get('cost') || 0),
                stock: parseInt(formData.get('stock') || 0),
                min_stock: parseInt(formData.get('min_stock') || 5),
                category: formData.get('category') || 'General',
                provider_id: formData.get('provider_id') ? parseInt(formData.get('provider_id')) : null
            };

            const res = editingId
                ? await api.put(`/products/${editingId}`, payload)
                : await api.post('/products', payload);

            if (!res.error) {
                isModalOpen = false;
                editingId = null;
                await loadData();
                safeRender();
            } else {
                api.showToast('Error al guardar el producto. Revisa los datos e inténtalo de nuevo.', true);
            }
        });

        // Controles de Paginación
        document.getElementById('prevPageBtn')?.addEventListener('click', async () => {
            if (currentPage > 1) {
                currentPage--;
                await loadData();
                safeRender();
            }
        });
        document.getElementById('nextPageBtn')?.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await loadData();
                safeRender();
            }
        });
    };

    await loadData();
    safeRender();
};