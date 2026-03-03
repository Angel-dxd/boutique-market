import { api } from '../../api.js';

export const renderPedidos = async (container) => {
    let isModalOpen = false;
    let editingId = null;
    let invoices = [];
    let suppliers = [];

    const loadData = async () => {
        const invRes = await api.get('/invoices');
        if (!invRes.error) {
            invoices = invRes;
        } else {
            invoices = [];
        }

        const supRes = await api.get('/providers');
        if (!supRes.error) {
            suppliers = supRes;
        } else {
            suppliers = [];
        }
    };

    const safeRender = () => {
        // Calcs
        const totalDebt = invoices.reduce((acc, inv) => acc + parseFloat(inv.monto || 0), 0);

        container.innerHTML = `
            <div class="p-8 w-full max-w-7xl mx-auto">
                <h1 class="text-3xl font-black text-gray-800 mb-2">Gestión de Pedidos</h1>
                <p class="text-gray-500 font-medium mb-8">Control de facturas emitidas (MySQL Centralizado)</p>

                <!-- Resumen Blocks -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-start">
                         <div>
                            <p class="text-gray-400 font-bold uppercase text-xs tracking-wider">Deuda Pendiente</p>
                            <h2 class="text-3xl font-black text-red-500 mt-1">${totalDebt.toFixed(2)}€</h2>
                        </div>
                        <div class="p-3 bg-red-50 text-red-500 rounded-2xl"><i data-lucide="trending-down" width="24"></i></div>
                    </div>

                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-start">
                         <div>
                            <p class="text-gray-400 font-bold uppercase text-xs tracking-wider">Facturas Emitidas</p>
                            <h2 class="text-3xl font-black text-blue-600 mt-1">${invoices.length}</h2>
                        </div>
                        <div class="p-3 bg-blue-50 text-blue-600 rounded-2xl"><i data-lucide="file-text" width="24"></i></div>
                    </div>

                    <div id="addInvoiceBtn" class="bg-[#1e293b] p-6 rounded-3xl shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform text-white">
                        <div class="text-center">
                            <i data-lucide="plus" width="32" class="mx-auto mb-1"></i>
                            <p class="font-bold">Añadir Factura</p>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-6 border-b border-gray-50 flex items-center gap-2">
                        <i data-lucide="file-text" class="text-gray-400" width="20"></i>
                         <h3 class="font-black text-gray-700">Historial de Facturas</h3>
                    </div>
                     <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proveedor</th>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Monto</th>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Referencia</th>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                ${invoices.length > 0 ? invoices.map(inv => `
                                    <tr class="hover:bg-blue-50/30 transition-colors group">
                                        <td class="p-4 font-bold text-gray-700">
                                            ${suppliers.find(s => s.id == inv.proveedor_id)?.nombre || 'S/N'}
                                        </td>
                                        <td class="p-4 font-black text-gray-900">${parseFloat(inv.monto).toFixed(2)}€</td>
                                        <td class="p-4 text-gray-400 font-mono text-xs">${inv.referencia}</td>
                                        <td class="p-4 text-right flex justify-end gap-2 transition-opacity">
                                             <button class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg edit-inv" data-id="${inv.id}">
                                                <i data-lucide="edit-2" width="16"></i>
                                            </button>
                                            <button class="text-red-500 hover:bg-red-50 p-2 rounded-lg delete-inv" data-id="${inv.id}">
                                                <i data-lucide="trash" width="16"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr><td colspan="4" class="p-12 text-center text-gray-400 font-bold">No hay facturas cargadas en la base de datos.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Modal -->
                <div id="invoiceModal" class="fixed inset-0 z-50 bg-black/50 ${isModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-6" id="modalTitle">${editingId ? 'Editar Factura' : 'Nueva Factura'}</h3>
                        <form id="invoiceForm" class="space-y-4">
                            <input name="referencia" id="invRef" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Ref Factura (Alfanumérico)" required />
                            <select name="proveedor_id" id="invProv" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" required>
                                <option value="">Selecciona Proveedor (Obligatorio)</option>
                                ${suppliers.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
                            </select>
                            <input name="monto" id="invMonto" type="number" step="0.01" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Monto Deuda €" required />
                            
                             <div class="flex gap-3 pt-4">
                                <button type="button" id="closeInvoiceModal" class="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
                                <button type="submit" class="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-black">Guardar a MySQL</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        document.getElementById('addInvoiceBtn').addEventListener('click', () => {
            editingId = null;
            isModalOpen = true;
            safeRender();
        });

        if (isModalOpen) {
            document.getElementById('closeInvoiceModal').addEventListener('click', () => {
                isModalOpen = false;
                editingId = null;
                safeRender();
            });

            document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payloadData = {
                    referencia: formData.get('referencia'),
                    proveedor_id: parseInt(formData.get('proveedor_id')),
                    monto: parseFloat(formData.get('monto'))
                };

                let response;
                if (editingId) {
                    response = await api.put(`/invoices/${editingId}`, payloadData);
                } else {
                    response = await api.post('/invoices', payloadData);
                }

                if (!response.error) {
                    isModalOpen = false;
                    await loadData();
                    safeRender();
                }
            });

            // Pre-fill if editing
            if (editingId) {
                const inv = invoices.find(i => i.id === editingId);
                if (inv) {
                    document.getElementById('invRef').value = inv.referencia;
                    document.getElementById('invProv').value = inv.proveedor_id;
                    document.getElementById('invMonto').value = inv.monto;
                }
            }
        }

        document.querySelectorAll('.delete-inv').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('¿PURGAR factura permanentemente de la base de datos MySQL?')) {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const response = await api.delete(`/invoices/${id}`);
                    if (!response.error) {
                        await loadData();
                        safeRender();
                    }
                }
            });
        });

        document.querySelectorAll('.edit-inv').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingId = parseInt(btn.getAttribute('data-id'));
                isModalOpen = true;
                safeRender();
            });
        });
    };

    await loadData();
    safeRender();
};
