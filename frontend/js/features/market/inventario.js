import { store } from '../../store.js';

export const renderInventario = (container) => {
    let searchTerm = '';
    let isAddOpen = false;
    let editingId = null;

    const render = () => {
        const state = store.getState();
        const products = state.products;

        const filtered = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

        container.innerHTML = `
             <div class="p-8 w-full max-w-7xl mx-auto">
                 <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                     <div class="flex justify-between items-center mb-6">
                        <div>
                            <h1 class="text-3xl font-black text-gray-800 tracking-tight">Inventario</h1>
                            <p class="text-gray-500 font-medium">Control de existencias</p>
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
                                        <div class="text-xs text-gray-400">${p.min_stock} min</div>
                                    </td>
                                    <td class="p-5">
                                        <div class="flex items-center gap-3">
                                            <button class="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center btn-stock" data-id="${p.id}" data-change="-1">-</button>
                                            <span class="font-black">${p.stock}</span>
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
                </div>
                
                 <!-- Modal -->
                 <div id="prodModal" class="fixed inset-0 z-50 bg-black/50 ${isAddOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                        <h2 class="text-2xl font-black text-gray-800 mb-8" id="prodModalTitle">${editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <form id="prodForm" class="space-y-6">
                            <input type="hidden" name="id" id="prodId">
                            <input name="title" id="prodTitle" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold" placeholder="Nombre" required />
                            <div class="grid grid-cols-2 gap-4">
                                <input name="price" id="prodPrice" type="number" step="0.01" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Precio €" required />
                                <input name="stock" id="prodStock" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Stock Inicial" required />
                            </div>
                            <!-- Min Stock field for completeness -->
                             <input name="min_stock" id="prodMinStock" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Stock Mínimo (Alerta)" value="5" />
                            
                            <div class="flex gap-3 pt-2">
                                <button type="button" id="closeProdModal" class="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
                                <button type="submit" class="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-black">Guardar</button>
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
                document.getElementById('prodId').value = p.id;
                document.getElementById('prodTitle').value = p.title;
                document.getElementById('prodPrice').value = p.price;
                document.getElementById('prodStock').value = p.stock;
                document.getElementById('prodMinStock').value = p.min_stock || 5;
            }
        }

        document.getElementById('searchProd').addEventListener('input', (e) => {
            searchTerm = e.target.value;
            render();
            const input = document.getElementById('searchProd');
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        });

        document.querySelectorAll('.btn-stock').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const change = parseInt(btn.getAttribute('data-change'));
                const prod = products.find(p => p.id === id);
                if (prod) {
                    store.updateProduct(id, { stock: Math.max(0, parseInt(prod.stock) + change) });
                    render();
                }
            });
        });

        document.querySelectorAll('.delete-prod').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('¿Eliminar producto?')) {
                    store.deleteProduct(parseInt(btn.getAttribute('data-id')));
                    render();
                }
            });
        });

        // Edit Listener
        document.querySelectorAll('.edit-prod').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingId = parseInt(btn.getAttribute('data-id'));
                isAddOpen = true;
                render();
            });
        });

        document.getElementById('addProdBtn').addEventListener('click', () => {
            editingId = null;
            isAddOpen = true;
            render();
        });

        if (isAddOpen) {
            document.getElementById('closeProdModal').addEventListener('click', () => {
                isAddOpen = false;
                editingId = null;
                render();
            });
            document.getElementById('prodForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    title: formData.get('title'),
                    price: parseFloat(formData.get('price')),
                    stock: parseInt(formData.get('stock')),
                    min_stock: parseInt(formData.get('min_stock')) || 5
                };

                if (editingId) {
                    store.updateProduct(editingId, data);
                    editingId = null;
                } else {
                    store.addProduct(data);
                }

                isAddOpen = false;
                safeRender();
            });
        }
    };

    // Initial render
    render();
};
