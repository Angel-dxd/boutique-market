import { api } from '../../api.js';

export const renderInventario = async (container) => {
    let searchTerm = '';
    let isAddOpen = false;
    let editingId = null;
    let products = [];
    let suppliers = [];

    const loadData = async () => {
        // Fetch products and suppliers (to show supplier name if needed, though originally it didn't show supplier. Let's fetch products mainly).
        const res = await api.get('/products');
        if (!res.error) {
            products = res;
        } else {
            products = [];
        }

        // Fetch suppliers for the dropdown when creating a product
        const supRes = await api.get('/providers');
        if (!supRes.error) {
            suppliers = supRes;
        } else {
            suppliers = [];
        }
    };

    const safeRender = () => {
        const filtered = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

        container.innerHTML = `
             <div class="p-8 w-full max-w-7xl mx-auto">
                 <header class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                     <div class="flex justify-between items-center mb-6">
                        <div>
                            <h1 class="text-3xl font-black text-gray-800 tracking-tight">Inventario</h1>
                            <p class="text-gray-500 font-medium">Control de existencias (MySQL Centralizado)</p>
                        </div>
                     </div>
                     
                     <div class="flex gap-4 w-full justify-between items-center mb-6">
                         <div class="relative flex-1 max-w-md">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20"></i>
                            <input
                                id="searchProd"
                                type="text"
                                placeholder="Buscar producto..."
                                class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                                value="${searchTerm}"
                            />
                        </div>
                        <button id="addProdBtn" class="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-black flex items-center gap-2">
                             <i data-lucide="plus" width="20"></i> Nuevo
                        </button>
                     </div>
                </header>

                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Producto</th>
                                <th class="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                                <th class="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                                <th class="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                         <tbody class="divide-y divide-gray-50">
                            ${filtered.map(p => `
                                <tr class="hover:bg-gray-50/50 transition-colors">
                                    <td class="p-5">
                                        <div class="font-bold text-gray-800">${p.title}</div>
                                        <div class="text-xs text-gray-400">${p.min_stock} min | ${p.categoria || 'General'}</div>
                                    </td>
                                    <td class="p-5">
                                        <div class="flex items-center gap-3">
                                            <button class="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center btn-stock" data-id="${p.id}" data-change="-1">-</button>
                                            <span class="font-black ${p.stock <= p.min_stock ? 'text-red-500' : 'text-green-600'}">${p.stock}</span>
                                            <button class="w-8 h-8 rounded-full bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 flex items-center justify-center btn-stock" data-id="${p.id}" data-change="1">+</button>
                                        </div>
                                    </td>
                                    <td class="p-5 font-bold text-gray-600">${parseFloat(p.price).toFixed(2)}€</td>
                                    <td class="p-5 text-right flex justify-end gap-2">
                                        <button class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg edit-prod" data-id="${p.id}">
                                            <i data-lucide="edit-2" width="16"></i>
                                        </button>
                                        <button class="text-red-500 hover:bg-red-50 p-2 rounded-lg delete-prod" data-id="${p.id}">
                                            <i data-lucide="trash" width="16"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                         </tbody>
                    </table>
                    ${filtered.length === 0 ? `<div class="p-10 text-center text-gray-400 font-bold">No hay productos en tu base de datos MySQL central.</div>` : ''}
                </div>
                
                 <!-- Modal -->
                 <div id="prodModal" class="fixed inset-0 z-50 bg-black/50 ${isAddOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                        <h2 class="text-2xl font-black text-gray-800 mb-8" id="prodModalTitle">${editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <form id="prodForm" class="space-y-6">
                            <input name="title" id="prodTitle" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold" placeholder="Nombre del Producto" required />
                            <div class="grid grid-cols-2 gap-4">
                                <input name="price" id="prodPrice" type="number" step="0.01" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Precio Venta €" required />
                                <input name="cost" id="prodCost" type="number" step="0.01" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Costo Compra €" />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <input name="stock" id="prodStock" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Stock Inicial" required />
                                <input name="min_stock" id="prodMinStock" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Stock Mínimo (Alerta)" value="5" />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <select name="categoria" id="prodCategory" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                    <option value="General">General</option>
                                    <option value="Carnes">Carnes</option>
                                    <option value="Lácteos">Lácteos</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Limpieza">Limpieza</option>
                                </select>
                                <select name="proveedor_id" id="prodProvider" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                    <option value="">Sin Proveedor</option>
                                    ${suppliers.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
                                </select>
                            </div>
                            
                            <div class="flex gap-3 pt-2">
                                <button type="button" id="closeProdModal" class="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
                                <button type="submit" class="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-black">Guardar a MySQL</button>
                            </div>
                        </form>
                    </div>
                </div>
             </div>
        `;
        lucide.createIcons();

        // Fill form if editing
        if (editingId) {
            const p = products.find(prod => prod.id === editingId);
            if (p) {
                document.getElementById('prodTitle').value = p.title;
                document.getElementById('prodPrice').value = p.price;
                document.getElementById('prodCost').value = p.cost || 0;
                document.getElementById('prodStock').value = p.stock;
                document.getElementById('prodMinStock').value = p.min_stock || 5;
                document.getElementById('prodCategory').value = p.categoria || 'General';
                document.getElementById('prodProvider').value = p.proveedor_id || '';
            }
        }

        document.getElementById('searchProd').addEventListener('input', (e) => {
            searchTerm = e.target.value;
            safeRender();
            const input = document.getElementById('searchProd');
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        });

        document.querySelectorAll('.btn-stock').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const change = parseInt(btn.getAttribute('data-change'));
                const prod = products.find(p => p.id === id);
                if (prod) {
                    const newStock = Math.max(0, parseInt(prod.stock) + change);
                    const response = await api.put(`/products/${id}/stock`, { stock: newStock });
                    if (!response.error) {
                        await loadData();
                        safeRender();
                    }
                }
            });
        });

        document.querySelectorAll('.delete-prod').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('¿PURGAR producto permanentemente de la base de datos MySQL?')) {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const response = await api.delete(`/products/${id}`);
                    if (!response.error) {
                        await loadData();
                        safeRender();
                    }
                }
            });
        });

        // Edit Listener
        document.querySelectorAll('.edit-prod').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingId = parseInt(btn.getAttribute('data-id'));
                isAddOpen = true;
                safeRender();
            });
        });

        document.getElementById('addProdBtn').addEventListener('click', () => {
            editingId = null;
            isAddOpen = true;
            safeRender();
        });

        if (isAddOpen) {
            document.getElementById('closeProdModal').addEventListener('click', () => {
                isAddOpen = false;
                editingId = null;
                safeRender();
            });

            document.getElementById('prodForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payloadData = {
                    title: formData.get('title'),
                    price: parseFloat(formData.get('price')),
                    cost: parseFloat(formData.get('cost')),
                    stock: parseInt(formData.get('stock')),
                    min_stock: parseInt(formData.get('min_stock')) || 5,
                    categoria: formData.get('categoria'),
                    proveedor_id: formData.get('proveedor_id') ? parseInt(formData.get('proveedor_id')) : null
                };

                let response;
                if (editingId) {
                    // Update current logic uses createProduct strictly? The api has no updateProduct route entirely right now, except for stock updates.
                    // Let me check what routes I have!
                    // Wait! I need to implement UPDATE PRODUCT in the backend if there is none!
                    // The backend `inventoryController.js` only has `updateProductStock` not full `updateProduct`.
                    // So I will make a separate POST to recreate it or just implement `updateProduct`.
                    // To avoid crash if backend misses it, I'll alert the user or fallback.
                    // Actually, let's pretend we have it, I'll add it to the backend next.
                    response = await api.put(`/products/${editingId}`, payloadData);
                } else {
                    response = await api.post('/products', payloadData);
                }

                if (!response.error) {
                    isAddOpen = false;
                    await loadData();
                    safeRender();
                } else if (response.error.includes("404")) {
                    alert("El backend no tiene implementada la ruta de edición completa, inténtalo más tarde.");
                }
            });
        }
    };

    await loadData();
    safeRender();
};
