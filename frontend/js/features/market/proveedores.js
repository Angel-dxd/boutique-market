import { store } from '../../store.js';

export const renderProveedores = (container) => {
    let isModalOpen = false;

    const render = () => {
        const suppliers = store.getState().suppliers;

        container.innerHTML = `
             <div class="p-8 w-full max-w-7xl mx-auto">
                <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 class="text-4xl font-black text-gray-800 tracking-tight">Proveedores</h1>
                        <p class="text-gray-500 font-medium">Aliados comerciales</p>
                    </div>
                     <button id="addSupplierBtn" class="bg-[#1e293b] text-white px-8 py-4 rounded-3xl font-black flex items-center gap-3 shadow-xl">
                        <i data-lucide="user-plus" width="22"></i> NUEVO CONTACTO
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${suppliers.map(s => `
                        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
                             <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div class="text-gray-300 hover:text-blue-500 cursor-pointer edit-supplier" data-id="${s.id}">
                                    <i data-lucide="edit-2" width="16"></i>
                                </div>
                                <div class="text-gray-300 hover:text-red-500 cursor-pointer delete-supplier" data-id="${s.id}">
                                    <i data-lucide="trash" width="16"></i>
                                </div>
                            </div>
                            <div class="flex items-center gap-5 mb-6">
                                <div class="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                                    <i data-lucide="building-2" width="28"></i>
                                </div>
                                <div>
                                    <h3 class="font-black text-gray-800 text-xl leading-tight">${s.nombre}</h3>
                                    <span class="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-widest mt-1 inline-block">
                                        ${s.categoria || s.category || 'General'}
                                    </span>
                                </div>
                            </div>
                             <div class="space-y-4 pt-6 border-t border-gray-50">
                                <div class="flex items-center gap-4 text-gray-600 font-bold">
                                    <div class="p-2 bg-gray-50 rounded-xl"><i data-lucide="phone" width="18"></i></div>
                                    ${s.telefono || '---'}
                                </div>
                                 <div class="flex items-center gap-4 text-gray-600 font-bold">
                                    <div class="p-2 bg-gray-50 rounded-xl"><i data-lucide="tag" width="18"></i></div>
                                    ${s.empresa || '---'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Modal -->
                 <div id="supplierModal" class="fixed inset-0 z-50 bg-black/50 ${isModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                        <h2 class="text-2xl font-black text-gray-800 mb-6" id="modalTitle">Nuevo Proveedor</h2>
                        <form id="supplierForm" class="space-y-4">
                             <input type="hidden" name="id" id="supplierId">
                             <input name="nombre" id="supplierName" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Nombre" required />
                             <input name="empresa" id="supplierCompany" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Empresa" />
                             <div class="grid grid-cols-2 gap-4">
                                <input name="telefono" id="supplierPhone" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Teléfono" />
                                <select name="categoria" id="supplierCategory" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800">
                                    <option>Producto</option>
                                    <option>Servicios</option>
                                    <option>Logística</option>
                                </select>
                             </div>
                             <div class="flex gap-3 pt-4">
                                <button type="button" id="closeSupplierModal" class="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
                                <button type="submit" class="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-black">Guardar</button>
                            </div>
                        </form>
                    </div>
                 </div>
             </div>
        `;

        lucide.createIcons();

        // Reset fn
        const resetForm = () => {
            document.getElementById('supplierForm').reset();
            document.getElementById('supplierId').value = '';
            document.getElementById('modalTitle').textContent = 'Nuevo Proveedor';
        };

        document.getElementById('addSupplierBtn').addEventListener('click', () => {
            resetForm();
            isModalOpen = true;
            render();
        });

        if (isModalOpen) {
            document.getElementById('closeSupplierModal').addEventListener('click', () => {
                isModalOpen = false;
                render();
            });

            document.getElementById('supplierForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const id = formData.get('id');
                const data = {
                    nombre: formData.get('nombre'),
                    empresa: formData.get('empresa'),
                    telefono: formData.get('telefono'),
                    categoria: formData.get('categoria')
                };

                if (id) {
                    store.updateSupplier(parseInt(id), data);
                } else {
                    store.addSupplier(data);
                }
                isModalOpen = false;
                render();
            });
        }

        // Edit Listeners
        document.querySelectorAll('.edit-supplier').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const supplier = suppliers.find(s => s.id === id);
                if (supplier) {
                    isModalOpen = true;
                    // Pre-fill needs render first due to full-render approach, so we set open then find header
                    // But in this arch we re-render whole thing.
                    // Solution: Set hidden inputs/values after render if we rely on state?
                    // Better: We set a "currentEditingId" in local module state or just pass it?
                    // Quickest fix for this patterns: 
                    // 1. Set global/module var like `editingSupplierId`
                    // 2. Or manipulate DOM directly after setting open true (but render() overwrites)
                    // Let's use specific DOM manipulation safely or re-render with "Edit Mode"

                    // Actually, let's just populate form values *after* render if open??
                    // Wait, render() clears DOM. So we need to set state before calling render().

                    // Hack for simplicity: Let's manually populate AFTER render loop if we passed "editId" to render?
                    // Or just query DOM elements here? No, render called again clears them.

                    // Correct Pattern for this Vanilla architecture:
                    // We need to know we are editing.
                    // Let's set the form values *in the HTML generation* or use a state variable `editingId`.

                    // Simpler: Just open modal and populate it manually?
                    // Problem: render() resets HTML.

                    // Let's use `editingSupplier` state variable.
                }
            });
        });

        // Re-implementing correctly:
        // We will just attach listeners to buttons, and inside click handler we:
        // 1. Populate form fields (which exist because modal is in DOM, just hidden/shown)
        // 2. Show modal.
        // Wait, current `render` recreates DOM every time.
        // So `isModalOpen` triggers a re-render.
        // If we want to pre-fill, we need `editingSupplier` state to persist across that re-render.

        // Let's rely on event delegation or just simple ID tracking.

        // Revised approach below in `render`.

    };

    // We need state outside render to persist "editing" status or data
    let editingId = null;

    // Wrap original render to include logic
    const originalRender = render;

    // Correct Implementation of the module logic:
    // Redefining render to include the editingId logic

    const safeRender = () => {
        const suppliers = store.getState().suppliers;

        container.innerHTML = `
             <div class="p-8 w-full max-w-7xl mx-auto">
                <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 class="text-4xl font-black text-gray-800 tracking-tight">Proveedores</h1>
                        <p class="text-gray-500 font-medium">Aliados comerciales</p>
                    </div>
                     <button id="addSupplierBtn" class="bg-[#1e293b] text-white px-8 py-4 rounded-3xl font-black flex items-center gap-3 shadow-xl">
                        <i data-lucide="user-plus" width="22"></i> NUEVO CONTACTO
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${suppliers.map(s => `
                        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
                             <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div class="text-gray-300 hover:text-blue-500 cursor-pointer edit-supplier" data-id="${s.id}">
                                    <i data-lucide="edit-2" width="16"></i>
                                </div>
                                <div class="text-gray-300 hover:text-red-500 cursor-pointer delete-supplier" data-id="${s.id}">
                                    <i data-lucide="trash" width="16"></i>
                                </div>
                            </div>
                            <div class="flex items-center gap-5 mb-6">
                                <div class="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                                    <i data-lucide="building-2" width="28"></i>
                                </div>
                                <div>
                                    <h3 class="font-black text-gray-800 text-xl leading-tight">${s.nombre}</h3>
                                    <span class="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-widest mt-1 inline-block">
                                        ${s.categoria || s.category || 'General'}
                                    </span>
                                </div>
                            </div>
                             <div class="space-y-4 pt-6 border-t border-gray-50">
                                <div class="flex items-center gap-4 text-gray-600 font-bold">
                                    <div class="p-2 bg-gray-50 rounded-xl"><i data-lucide="phone" width="18"></i></div>
                                    ${s.telefono || '---'}
                                </div>
                                 <div class="flex items-center gap-4 text-gray-600 font-bold">
                                    <div class="p-2 bg-gray-50 rounded-xl"><i data-lucide="tag" width="18"></i></div>
                                    ${s.empresa || '---'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Modal -->
                 <div id="supplierModal" class="fixed inset-0 z-50 bg-black/50 ${isModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                        <h2 class="text-2xl font-black text-gray-800 mb-6" id="modalTitle">${editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                        <form id="supplierForm" class="space-y-4">
                             <input type="hidden" name="id" id="supplierId">
                             <input name="nombre" id="supplierName" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Nombre" required />
                             <input name="empresa" id="supplierCompany" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Empresa" />
                             <div class="grid grid-cols-2 gap-4">
                                <input name="telefono" id="supplierPhone" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Teléfono" />
                                <select name="categoria" id="supplierCategory" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800">
                                    <option>Producto</option>
                                    <option>Servicios</option>
                                    <option>Logística</option>
                                </select>
                             </div>
                             <div class="flex gap-3 pt-4">
                                <button type="button" id="closeSupplierModal" class="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
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
            const s = suppliers.find(su => su.id === editingId);
            if (s) {
                document.getElementById('supplierId').value = s.id;
                document.getElementById('supplierName').value = s.nombre;
                document.getElementById('supplierCompany').value = s.empresa || '';
                document.getElementById('supplierPhone').value = s.telefono || '';
                document.getElementById('supplierCategory').value = s.categoria || 'Producto';
            }
        }

        document.getElementById('addSupplierBtn').addEventListener('click', () => {
            editingId = null;
            isModalOpen = true;
            safeRender();
        });

        if (isModalOpen) {
            document.getElementById('closeSupplierModal').addEventListener('click', () => {
                isModalOpen = false;
                editingId = null;
                safeRender();
            });

            document.getElementById('supplierForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    nombre: formData.get('nombre'),
                    empresa: formData.get('empresa'),
                    telefono: formData.get('telefono'),
                    categoria: formData.get('categoria')
                };

                if (editingId) {
                    store.updateSupplier(editingId, data);
                    editingId = null;
                } else {
                    store.addSupplier(data);
                }
                isModalOpen = false;
                safeRender();
            });
        }

        document.querySelectorAll('.delete-supplier').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('¿Eliminar proveedor?')) {
                    store.deleteSupplier(parseInt(btn.getAttribute('data-id')));
                    safeRender();
                }
            });
        });

        document.querySelectorAll('.edit-supplier').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingId = parseInt(btn.getAttribute('data-id'));
                isModalOpen = true;
                safeRender();
            });
        });
    };

    safeRender();
    render = safeRender; // Update reference if needed, but in this closure structure we just call safeRender
};
