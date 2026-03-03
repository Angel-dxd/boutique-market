import { api } from '../../api.js';

export const renderProveedores = async (container) => {
    let isModalOpen = false;
    let editingId = null;
    let suppliers = [];

    // Función para recargar la data real desde MySQL
    const loadData = async () => {
        const res = await api.get('/providers');
        if (!res.error) {
            suppliers = res;
        } else {
            suppliers = [];
        }
    };

    const safeRender = () => {
        container.innerHTML = `
             <div class="p-8 w-full max-w-7xl mx-auto">
                <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 class="text-4xl font-black text-gray-800 tracking-tight">Proveedores</h1>
                        <p class="text-gray-500 font-medium">Aliados comerciales (MySQL Centralizado)</p>
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
                                    ${s.telefono || 'Sin registrar'}
                                </div>
                                 <div class="flex items-center gap-4 text-gray-600 font-bold">
                                    <div class="p-2 bg-gray-50 rounded-xl"><i data-lucide="tag" width="18"></i></div>
                                    ${s.empresa || 'Independiente'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${suppliers.length === 0 ? `<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-gray-400 font-bold">Aún no tienes proveedores en tu base de datos MySQL.</div>` : ''}
                </div>

                <!-- Modal -->
                 <div id="supplierModal" class="fixed inset-0 z-50 bg-black/50 ${isModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                        <h2 class="text-2xl font-black text-gray-800 mb-6" id="modalTitle">${editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                        <form id="supplierForm" class="space-y-4">
                             <input name="nombre" id="supplierName" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Nombre (Obligatorio)" required />
                             <input name="empresa" id="supplierCompany" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Empresa" />
                             <div class="grid grid-cols-2 gap-4">
                                <input name="telefono" id="supplierPhone" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Teléfono" />
                                <select name="categoria" id="supplierCategory" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800">
                                    <option>Suministros</option>
                                    <option>Producto</option>
                                    <option>Servicios</option>
                                    <option>Logística</option>
                                </select>
                             </div>
                             <div class="flex gap-3 pt-4">
                                <button type="button" id="closeSupplierModal" class="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
                                <button type="submit" class="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-black">Guardar en MySQL</button>
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
                document.getElementById('supplierName').value = s.nombre;
                document.getElementById('supplierCompany').value = s.empresa || '';
                document.getElementById('supplierPhone').value = s.telefono || '';
                // Set correct select value if matches
                const options = Array.from(document.getElementById('supplierCategory').options);
                const hasMatch = options.find(o => o.value === (s.categoria || s.category));
                if (hasMatch) document.getElementById('supplierCategory').value = s.categoria || s.category;
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

            document.getElementById('supplierForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payloadData = {
                    nombre: formData.get('nombre'),
                    empresa: formData.get('empresa'),
                    telefono: formData.get('telefono'),
                    categoria: formData.get('categoria')
                };

                let response;
                if (editingId) {
                    response = await api.put(`/providers/${editingId}`, payloadData);
                    editingId = null;
                } else {
                    response = await api.post('/providers', payloadData);
                }

                if (!response.error) {
                    isModalOpen = false;
                    await loadData();
                    safeRender();
                }
            });
        }

        document.querySelectorAll('.delete-supplier').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('¿PURGAR proveedor permanentemente de la base de datos MySQL?')) {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const response = await api.delete(`/providers/${id}`);
                    if (!response.error) {
                        await loadData();
                        safeRender();
                    }
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

    // Al iniciar la vista, primero cargamos la red desde MySQL
    await loadData();
    safeRender();
};
