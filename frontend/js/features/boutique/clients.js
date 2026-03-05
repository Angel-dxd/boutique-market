import { api } from '../../api.js';

export const renderClients = async (container) => {
    // State
    let searchTerm = '';
    let editingId = null;
    let clients = [];

    // --- FUNCIÓN ASÍNCRONA PARA MYSQL (NUEVA) ---
    const refreshData = async () => {
        try {
            const response = await api.get('/clients');
            if (!response.error) {
                clients = response;
                safeRender();
            }
        } catch (error) {
            console.error("Error conectando con MySQL:", error);
        }
    };

    const safeRender = () => {
        const filtered = clients.filter(c =>
            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').includes(searchTerm)
        );

        const currentUser = localStorage.getItem('currentUser') || 'arelys';

        // Main Container 
        container.innerHTML = `
            <div class="space-y-6 h-full flex flex-col min-h-[600px] animate-fade-in-up">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                             Cartera de Clientes
                        </h2>
                        <p class="text-gray-500 mt-1">${filtered.length} clientes registrados</p>
                    </div>

                    <div class="flex flex-wrap gap-3 w-full md:w-auto">
                        <div class="relative flex-1 md:w-64">
                             <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="18"></i>
                            <input
                                type="text"
                                id="searchInput"
                                placeholder="Buscar cliente..."
                                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                value="${searchTerm}"
                            />
                        </div>

                         <button
                            id="importBtn"
                            class="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-2 border border-blue-100"
                        >
                            <i data-lucide="upload" width="18"></i> <span class="hidden sm:inline">Importar CSV</span>
                        </button>
                        <input type="file" id="importInput" accept=".csv" class="hidden" />

                        <button
                            id="newClientBtn"
                            class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                        >
                            <i data-lucide="plus" width="18"></i> Nuevo Cliente
                        </button>
                        
                        ${currentUser === 'santi' || true ? `
                            <button
                                id="exportBtn"
                                class="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <i data-lucide="download" width="18"></i> Exportar
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                     ${filtered.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th class="p-5">Cliente</th>
                                        <th class="p-5">Contacto</th>
                                        <th class="p-5">Notas / Preferencias</th>
                                        <th class="p-5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-50 text-sm">
                                    ${filtered.map(client => `
                                        <tr class="hover:bg-emerald-50/30 transition-colors group">
                                            <td class="p-5">
                                                <div class="flex items-center gap-4">
                                                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
                                                        ${client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span class="font-bold text-gray-700 text-base">${client.name}</span>
                                                </div>
                                            </td>
                                            <td class="p-5">
                                                <div class="flex flex-col gap-1">
                                                    <div class="flex items-center gap-2 text-gray-700 font-medium">
                                                        <i data-lucide="phone" width="14" class="text-emerald-500"></i> ${client.phone || 'Sin móvil'}
                                                    </div>
                                                    ${client.email ? `
                                                        <div class="flex items-center gap-2 text-gray-400 text-xs">
                                                            <i data-lucide="mail" width="12"></i> ${client.email}
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            </td>
                                            <td class="p-5">
                                                <p class="text-gray-500 italic line-clamp-2 max-w-xs">
                                                    ${client.notes || '<span class="text-gray-300">Sin notas adicionales</span>'}
                                                </p>
                                            </td>
                                            <td class="p-5 text-right">
                                                <div class="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                                    <button class="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors edit-client-btn" data-id="${client.id}" title="Editar">
                                                        <i data-lucide="pencil" width="16"></i>
                                                    </button>
                                                    <button class="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors delete-client-btn" data-id="${client.id}" title="Eliminar">
                                                        <i data-lucide="trash-2" width="16"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                     ` : `
                        <div class="flex flex-col items-center justify-center flex-1 p-12 text-center">
                            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <i data-lucide="users" width="32" class="text-gray-300"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">No se encontraron clientes</h3>
                            <p class="text-gray-500 max-w-xs mx-auto">Prueba a buscar con otro término o añade un nuevo cliente a tu cartera.</p>
                        </div>
                     `}
                </div>
            </div>

            <div id="clientModalOverlay" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm hidden items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 class="text-xl font-bold text-gray-800" id="modalTitle">${editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                        <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i data-lucide="x" width="24"></i>
                        </button>
                    </div>
                    
                    <form id="clientForm" class="p-6 space-y-5">
                        <input type="hidden" name="id" id="clientIdInput">
                        
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre Completo</label>
                            <input type="text" name="name" id="clientNameInput" placeholder="Ej: María García" required 
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800" />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                             <div class="space-y-1">
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Teléfono</label>
                                <input type="tel" name="phone" id="clientPhoneInput" placeholder="600000000" 
                                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                            </div>
                             <div class="space-y-1">
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                                <input type="email" name="email" id="clientEmailInput" placeholder="maria@email.com" 
                                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Notas / Preferencias</label>
                            <textarea name="notes" id="clientNotesInput" rows="3" placeholder="Ej: Alérgica al látex, prefiere citas por la mañana..." 
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"></textarea>
                        </div>
                        
                        <div class="pt-4 flex gap-3">
                            <button type="button" id="cancelModalBtn" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" class="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        lucide.createIcons();

        // 1. Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                safeRender();
                const newHeader = document.getElementById('searchInput');
                if (newHeader) {
                    newHeader.focus();
                    newHeader.setSelectionRange(newHeader.value.length, newHeader.value.length);
                }
            });
        }

        // 2. Open Modal (New)
        document.getElementById('newClientBtn').addEventListener('click', () => {
            editingId = null;
            toggleModal(true);
        });

        // 3. Close Modal
        document.getElementById('closeModalBtn').addEventListener('click', () => toggleModal(false));
        document.getElementById('cancelModalBtn').addEventListener('click', () => toggleModal(false));

        const overlay = document.getElementById('clientModalOverlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) toggleModal(false);
        });

        // 4. Submit Form (CONECTADO A MYSQL VIA API.JS)
        document.getElementById('clientForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const clientData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                notes: formData.get('notes')
            };

            let response;
            if (editingId) {
                response = await api.put(`/clients/${editingId}`, clientData);
            } else {
                response = await api.post('/clients', clientData);
            }

            if (!response.error) {
                toggleModal(false);
                await refreshData();
            }
        });

        // 5. Edit Buttons
        document.querySelectorAll('.edit-client-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingId = parseInt(btn.getAttribute('data-id'));
                toggleModal(true);
            });
        });

        // 6. Delete Buttons (CONECTADO A MYSQL)
        document.querySelectorAll('.delete-client-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('¿PURGAR cliente permanentemente?')) {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const response = await api.delete(`/clients/${id}`);
                    if (!response.error) {
                        await refreshData();
                    }
                }
            });
        });

        // 7. Import CSV
        const importBtn = document.getElementById('importBtn');
        const importInput = document.getElementById('importInput');
        if (importBtn && importInput) {
            importBtn.onclick = () => importInput.click();
            importInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('csvFile', file);

                // For this mock, simulate bulk import since no bulk route exists for clients yet,
                // Wait, clientController might not have bulk upload yet.
                // Let's implement the previous logic but saving via individual POST requests asynchronously
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const csv = event.target.result;
                    const lines = csv.split('\n');
                    let count = 0;

                    api.showLoading();
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i];
                        if (!line.trim()) continue;
                        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                        const cols = matches ? matches.map(m => m.replace(/^"|"$/g, '').trim()) : line.split(',');

                        if (cols.length >= 1 && cols[0]) {
                            await api.post('/clients', {
                                name: cols[0],
                                phone: cols[1] || '',
                                email: cols[2] || '',
                                notes: cols[3] || ''
                            });
                            count++;
                        }
                    }
                    api.hideLoading();
                    api.showToast(`Se importaron ${count} clientes`, 'success');
                    await refreshData();
                };
                reader.readAsText(file);
                e.target.value = '';
            };
        }

        // Export (Santi)
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.onclick = () => {
                let csv = "ID,Nombre,Telefono,Email,Notas\n";
                clients.forEach(c => {
                    const safe = (txt) => `"${(txt || '').toString().replace(/"/g, '""')}"`;
                    csv += `${c.id},${safe(c.name)},${safe(c.phone)},${safe(c.email)},${safe(c.notes)}\n`;
                });
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'clientes_mysql.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }
    };

    // Helper: Toggle Modal
    const toggleModal = (show) => {
        const modal = document.getElementById('clientModalOverlay');
        if (show) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.getElementById('modalTitle').textContent = editingId ? 'Editar Cliente' : 'Nuevo Cliente';

            if (editingId) {
                const client = clients.find(c => c.id === editingId);
                if (client) {
                    document.getElementById('clientIdInput').value = client.id;
                    document.getElementById('clientNameInput').value = client.name;
                    document.getElementById('clientPhoneInput').value = client.phone || '';
                    document.getElementById('clientEmailInput').value = client.email || '';
                    document.getElementById('clientNotesInput').value = client.notes || '';
                }
            } else {
                document.getElementById('clientForm').reset();
                document.getElementById('clientIdInput').value = '';
            }
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            editingId = null;
        }
    };

    // --- CARGA INICIAL ---
    await refreshData();
};