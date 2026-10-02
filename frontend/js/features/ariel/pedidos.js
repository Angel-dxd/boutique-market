/**
 * market/pedidos.js
 * Módulo de gestión de pedidos y facturas de proveedores para El Gallo Azul.
 * Gestiona la deuda pendiente y el historial de compras avanzado.
 */
import { api } from '../core/api.js';
import { showConfirm } from '../shared/modal.js';

export const renderPedidos = async (container) => {
    let isModalOpen = false;
    let editingId = null;
    let invoices = [];
    let suppliers = [];
    let currentTab = 'pending'; // 'pending' o 'paid'

    const loadData = async () => {
        const invRes = await api.get('/invoices');
        if (!invRes.error) invoices = invRes;
        else invoices = [];

        const supRes = await api.get('/providers');
        if (!supRes.error) suppliers = supRes;
        else suppliers = [];
    };

    const safeRender = () => {
        const pendingInvoices = invoices.filter(i => i.status === 'pending' || !i.status);
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const displayedInvoices = currentTab === 'pending' ? pendingInvoices : paidInvoices;

        const totalDebt = pendingInvoices.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);
        const totalPaid = paidInvoices.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);

        container.innerHTML = `
            <div class="p-4 md:p-8 w-full max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-1 md:mb-2">
                    <h1 class="text-xl md:text-3xl font-black text-gray-800">Gestión de Pedidos</h1>
                    <div id="addInvoiceBtn" class="bg-[#1e293b] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 cursor-pointer hover:bg-black transition-colors">
                        <i data-lucide="plus" width="16"></i> Nueva Factura
                    </div>
                </div>
                <p class="text-gray-500 font-medium mb-4 md:mb-8 text-sm">Control avanzado de tesorería y facturas emitidas</p>

                <!-- Resumen Blocks -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 mb-6 md:mb-10">
                    <div class="bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-6 rounded-3xl shadow-sm border border-red-100 flex justify-between items-start">
                         <div>
                            <p class="text-red-400 font-bold uppercase text-xs tracking-wider">Deuda Pendiente</p>
                            <h2 class="text-2xl md:text-4xl font-black text-red-600 mt-1">${totalDebt.toFixed(2)}€</h2>
                            <p class="text-red-500 text-xs mt-1 font-bold">${pendingInvoices.length} facturas sin pagar</p>
                        </div>
                        <div class="p-3 bg-red-100 text-red-500 rounded-2xl"><i data-lucide="alert-circle" width="24"></i></div>
                    </div>

                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 rounded-3xl shadow-sm border border-green-100 flex justify-between items-start">
                         <div>
                            <p class="text-green-500 font-bold uppercase text-xs tracking-wider">Total Pagado</p>
                            <h2 class="text-2xl md:text-4xl font-black text-green-600 mt-1">${totalPaid.toFixed(2)}€</h2>
                            <p class="text-green-600 text-xs mt-1 font-bold">${paidInvoices.length} facturas liquidadas</p>
                        </div>
                        <div class="p-3 bg-green-100 text-green-600 rounded-2xl"><i data-lucide="check-circle" width="24"></i></div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
                    <button class="px-6 py-2 rounded-lg font-bold text-sm transition-all ${currentTab === 'pending' ? 'bg-white text-[#1e293b] shadow-sm' : 'text-gray-500 hover:text-gray-700'} tab-btn" data-tab="pending">
                        Pendientes de Pago
                    </button>
                    <button class="px-6 py-2 rounded-lg font-bold text-sm transition-all ${currentTab === 'paid' ? 'bg-white text-[#1e293b] shadow-sm' : 'text-gray-500 hover:text-gray-700'} tab-btn" data-tab="paid">
                        Pagadas / Liquidadas
                    </button>
                </div>

                <!-- Table -->
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                     <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proveedor</th>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Referencia</th>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Monto</th>
                                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                ${displayedInvoices.length > 0 ? displayedInvoices.map(inv => `
                                    <tr class="hover:bg-gray-50/50 transition-colors group">
                                        <td class="p-4 text-gray-500 font-medium text-sm">
                                            ${inv.date ? new Date(inv.date).toLocaleDateString() : 'S/F'}
                                        </td>
                                        <td class="p-4 font-bold text-gray-800 flex flex-col">
                                            <span>${suppliers.find(s => s.id == inv.provider_id)?.name || 'S/N'}</span>
                                            ${inv.tax_included ? 
                                                `<span class="text-[10px] text-gray-400">IVA Incluido (${inv.tax_amount ? parseFloat(inv.tax_amount).toFixed(2) + '€' : '0.00€'})</span>` : 
                                                `<span class="text-[10px] text-orange-400">+ IVA a sumar (${inv.tax_amount ? parseFloat(inv.tax_amount).toFixed(2) + '€' : '0.00€'})</span>`
                                            }
                                        </td>
                                        <td class="p-4 text-gray-400 font-mono text-xs">${inv.reference}</td>
                                        <td class="p-4 font-black text-[#1e293b]">${parseFloat(inv.amount).toFixed(2)}€</td>
                                        <td class="p-4 text-right flex justify-end gap-2 transition-opacity">
                                            ${currentTab === 'pending' ? `
                                                <button class="text-green-500 hover:bg-green-50 p-2 rounded-lg mark-paid-inv tooltip" data-id="${inv.id}" title="Marcar como Pagada">
                                                    <i data-lucide="check" width="16"></i>
                                                </button>
                                            ` : `
                                                <button class="text-orange-500 hover:bg-orange-50 p-2 rounded-lg mark-pending-inv tooltip" data-id="${inv.id}" title="Devolver a Pendiente">
                                                    <i data-lucide="rotate-ccw" width="16"></i>
                                                </button>
                                            `}
                                            <button class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg edit-inv" data-id="${inv.id}">
                                                <i data-lucide="edit-2" width="16"></i>
                                            </button>
                                            <button class="text-red-500 hover:bg-red-50 p-2 rounded-lg delete-inv" data-id="${inv.id}">
                                                <i data-lucide="trash" width="16"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr><td colspan="5" class="p-12 text-center text-gray-400 font-bold">No hay facturas en esta sección.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Modal -->
                <div id="invoiceModal" class="fixed inset-0 z-50 bg-black/50 ${isModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-black text-gray-800" id="modalTitle">${editingId ? 'Editar Factura' : 'Nueva Factura'}</h3>
                            ${!editingId ? `
                            <button type="button" id="scanAIBtn" class="text-xs bg-[#1e293b] text-white hover:bg-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition-colors">
                                <i data-lucide="scan" width="16"></i> Captura OCR (Automática)
                            </button>
                            <input type="file" id="aiImageInput" accept="image/*,.pdf" class="hidden" />
                            ` : ''}
                        </div>
                        <form id="invoiceForm" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Proveedor *</label>
                                    <select name="provider_id" id="invProv" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" required>
                                        <option value="">Selecciona...</option>
                                        ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Fecha Emisión *</label>
                                    <input type="date" name="date" id="invDate" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" required />
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Ref / Documento *</label>
                                    <input name="reference" id="invRef" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800" placeholder="Ej: 26G1000..." required />
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Estado de Pago *</label>
                                    <select name="status" id="invStatus" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-800">
                                        <option value="pending">Pendiente</option>
                                        <option value="paid">Pagada</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1 ml-1">Monto Total (€) *</label>
                                <input name="amount" id="invMonto" type="number" step="0.01" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-2xl text-gray-800" placeholder="0.00" required />
                            </div>

                            <div class="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="tax_included" id="invTax" value="1" class="w-5 h-5 rounded border-gray-300 text-[#1e293b] focus:ring-[#1e293b] cursor-pointer" checked>
                                    <span class="text-sm font-bold text-gray-600">Monto incluye IVA</span>
                                </label>
                                <div class="flex items-center gap-2">
                                    <label class="text-xs font-bold text-gray-500">Monto IVA (€):</label>
                                    <input name="tax_amount" id="invTaxAmount" type="number" step="0.01" class="w-24 px-3 py-1.5 bg-white border border-gray-200 rounded-lg outline-none font-bold text-gray-800 text-right" placeholder="0.00" />
                                </div>
                            </div>
                            
                             <div class="flex gap-3 pt-6">
                                <button type="button" id="closeInvoiceModal" class="flex-1 py-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-2xl font-bold">Cancelar</button>
                                <button type="submit" class="flex-1 py-4 bg-[#1e293b] hover:bg-black transition-colors text-white rounded-2xl font-black">Guardar Factura</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        // Tabs Logic
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTab = btn.getAttribute('data-tab');
                safeRender();
            });
        });

        // Add Logic
        document.getElementById('addInvoiceBtn').addEventListener('click', () => {
            editingId = null;
            isModalOpen = true;
            safeRender();
            // Default date to today
            document.getElementById('invDate').value = new Date().toISOString().split('T')[0];
        });

        if (isModalOpen) {
            document.getElementById('closeInvoiceModal').addEventListener('click', () => {
                isModalOpen = false;
                editingId = null;
                safeRender();
            });

            // Scanner Logic
            const scanBtn = document.getElementById('scanAIBtn');
            const fileInput = document.getElementById('aiImageInput');
            
            if (scanBtn && fileInput) {
                scanBtn.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Limpiar el formulario justo antes de iniciar un nuevo escaneo
                    document.getElementById('invoiceForm').reset();
                    document.getElementById('invDate').value = new Date().toISOString().split('T')[0];
                    document.getElementById('invProv').value = '';
                    document.getElementById('invRef').value = '';
                    document.getElementById('invMonto').value = '';
                    document.getElementById('invTaxAmount').value = '';
                    document.getElementById('invTax').checked = true;

                    const originalText = scanBtn.innerHTML;
                    scanBtn.innerHTML = '<i data-lucide="loader" width="14" class="animate-spin"></i> Analizando...';
                    scanBtn.disabled = true;
                    lucide.createIcons();

                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                        const base64Image = ev.target.result;
                        const res = await api.post('/invoices/scan', { image: base64Image });
                        
                        if (!res.error && res.amount) {
                            api.showToast(res.message || 'Factura analizada por IA', false);
                            
                            document.getElementById('invRef').value = res.reference || '';
                            document.getElementById('invMonto').value = res.amount || '';
                            if(res.date) document.getElementById('invDate').value = res.date;
                            if(res.tax_included !== undefined) document.getElementById('invTax').checked = res.tax_included;
                            if(res.tax_amount !== undefined) document.getElementById('invTaxAmount').value = res.tax_amount;
                            
                            if (res.providerNameHint) {
                                const select = document.getElementById('invProv');
                                const options = Array.from(select.options);
                                const match = options.find(opt => opt.text.toLowerCase().includes(res.providerNameHint.toLowerCase()));
                                
                                if (match) {
                                    select.value = match.value;
                                } else {
                                    // Proveedor no encontrado -> Crearlo automáticamente
                                    api.showToast(`Detectado proveedor nuevo: ${res.providerNameHint}. Registrando...`, false);
                                    const newProvRes = await api.post('/providers', { name: res.providerNameHint });
                                    
                                    if (!newProvRes.error && newProvRes.id) {
                                        suppliers.push({ id: newProvRes.id, name: res.providerNameHint });
                                        
                                        const newOption = document.createElement('option');
                                        newOption.value = newProvRes.id;
                                        newOption.text = res.providerNameHint;
                                        select.appendChild(newOption);
                                        select.value = newProvRes.id;
                                    }
                                }
                            }
                        } else {
                            api.showToast(res.error || 'No se pudo leer la factura', true);
                        }
                        
                        scanBtn.innerHTML = originalText;
                        scanBtn.disabled = false;
                        lucide.createIcons();
                        
                        // Vaciar el valor del input para permitir escanear el mismo archivo repetidas veces
                        e.target.value = '';
                    };
                    reader.readAsDataURL(file);
                });
            }

            document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payloadData = {
                    reference: formData.get('reference'),
                    provider_id: parseInt(formData.get('provider_id')),
                    amount: parseFloat(formData.get('amount')),
                    date: formData.get('date'),
                    status: formData.get('status'),
                    tax_included: formData.has('tax_included'),
                    tax_amount: parseFloat(formData.get('tax_amount') || 0)
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
                    document.getElementById('invRef').value = inv.reference;
                    document.getElementById('invProv').value = inv.provider_id;
                    document.getElementById('invMonto').value = inv.amount;
                    document.getElementById('invStatus').value = inv.status || 'pending';
                    if (inv.date) {
                        document.getElementById('invDate').value = inv.date.split('T')[0];
                    }
                    document.getElementById('invTax').checked = !!inv.tax_included;
                    document.getElementById('invTaxAmount').value = inv.tax_amount || '';
                }
            }
        }

        // Quick Actions
        document.querySelectorAll('.mark-paid-inv').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const inv = invoices.find(i => i.id === id);
                if (inv) {
                    const response = await api.put(`/invoices/${id}`, { ...inv, status: 'paid' });
                    if (!response.error) {
                        api.showToast('Factura marcada como pagada', false);
                        await loadData();
                        safeRender();
                    }
                }
            });
        });

        document.querySelectorAll('.mark-pending-inv').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const inv = invoices.find(i => i.id === id);
                if (inv) {
                    const response = await api.put(`/invoices/${id}`, { ...inv, status: 'pending' });
                    if (!response.error) {
                        api.showToast('Factura devuelta a pendiente', true);
                        await loadData();
                        safeRender();
                    }
                }
            });
        });

        // Standard Actions
        document.querySelectorAll('.delete-inv').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmed = await showConfirm(
                    'Eliminar Factura',
                    '¿PURGAR factura permanentemente?',
                    'Sí, purgar',
                    'Cancelar'
                );
                if (confirmed) {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const response = await api.delete(`/invoices/${id}`);
                    if (!response.error) {
                        await loadData();
                        safeRender();
                    } else {
                        api.showToast('Error al eliminar factura.', true);
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
