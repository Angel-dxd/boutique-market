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
                             <div class="absolute top-4 right-4 text-gray-300 group-hover:text-red-500 cursor-pointer delete-supplier" data-id="${s.id}">
                                <i data-lucide="trash" width="16"></i>
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
                        <h2 class="text-2xl font-black text-gray-800 mb-6">Nuevo Proveedor</h2>
                        <form id="supplierForm" class="space-y-4">
                             <input name="nombre" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Nombre" required />
                             <input name="empresa" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Empresa" />
                             <div class="grid grid-cols-2 gap-4">
                                <input name="telefono" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Teléfono" />
                                <select name="categoria" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800">
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

        document.getElementById('addSupplierBtn').addEventListener('click', () => {
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
                store.addSupplier({
                    nombre: formData.get('nombre'),
                    empresa: formData.get('empresa'),
                    telefono: formData.get('telefono'),
                    categoria: formData.get('categoria')
                });
                isModalOpen = false;
                render();
            });
        }

        document.querySelectorAll('.delete-supplier').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar proveedor?')) {
                    store.deleteSupplier(parseInt(btn.getAttribute('data-id')));
                    render();
                }
            });
        });
    };
    render();
};
