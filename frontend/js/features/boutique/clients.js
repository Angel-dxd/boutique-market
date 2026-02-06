import { store } from '../../store.js';

export const renderClients = (container) => {
    let searchTerm = '';

    const render = () => {
        const clients = store.getState().clients;

        const filtered = clients.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        );

        container.innerHTML = `
             <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] flex flex-col">
                <!-- Header -->
                <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                             Listado de Clientes
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">LOCAL</span>
                        </h2>
                        <p class="text-sm text-gray-500">${filtered.length} clientes encontrados</p>
                    </div>

                    <div class="flex gap-3 w-full md:w-auto">
                        <div class="relative flex-1 md:w-64">
                             <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="18"></i>
                            <input
                                type="text"
                                id="searchInput"
                                placeholder="Buscar..."
                                class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                value="${searchTerm}"
                            />
                        </div>
                        <button
                            id="newClientBtn"
                            class="bg-[#d4a373] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <i data-lucide="plus" width="16"></i> Nuevo
                        </button>
                    </div>
                </div>

                <!-- List -->
                <div class="flex-1 overflow-y-auto">
                     ${filtered.length > 0 ? `
                        <div class="md:w-full">
                            <div class="hidden md:grid grid-cols-12 bg-gray-50/50 text-gray-500 text-xs uppercase p-4 font-semibold border-b border-gray-100">
                                <div class="col-span-4">Cliente</div>
                                <div class="col-span-3">Contacto</div>
                                <div class="col-span-3">Notas</div>
                                <div class="col-span-2 text-right">Acciones</div>
                            </div>
                             <div class="divide-y divide-gray-50">
                                ${filtered.map(client => `
                                    <div class="p-4 md:grid md:grid-cols-12 md:items-center hover:bg-gray-50/50 transition-colors group">
                                         <div class="col-span-4 flex items-center gap-3 mb-2 md:mb-0">
                                            <div class="w-10 h-10 rounded-full bg-orange-50 text-[#d4a373] flex items-center justify-center font-bold text-sm shrink-0">
                                                ${client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-800">${client.name}</p>
                                            </div>
                                        </div>
                                         <div class="col-span-3 text-sm text-gray-600 mb-2 md:mb-0">
                                            <p>${client.phone || '-'}</p>
                                            <p class="text-xs text-gray-400">${client.email || ''}</p>
                                        </div>
                                        <div class="col-span-3 text-sm text-gray-500 italic truncate mb-2 md:mb-0">
                                            ${client.notes || 'Sin notas'}
                                        </div>
                                        <div class="col-span-2 flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                             <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg delete-btn" data-id="${client.id}">
                                                <i data-lucide="trash" width="16"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                             </div>
                        </div>
                     ` : `
                        <div class="flex flex-col items-center justify-center h-64 text-gray-400">
                            <i data-lucide="user" width="48" class="opacity-20 mb-2"></i>
                            <p>No se encontraron clientes</p>
                        </div>
                     `}
                </div>
             </div>

             <!-- Modal Container (Hidden by default) -->
             <div id="modalOverlay" class="fixed inset-0 z-50 bg-black/50 hidden items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                    <h3 class="text-xl font-bold text-gray-800 mb-6">Nuevo Cliente</h3>
                    <form id="clientForm" class="space-y-4">
                        <input type="text" name="name" placeholder="Nombre completo" required class="w-full px-4 py-2 border rounded-xl" />
                        <input type="text" name="phone" placeholder="Teléfono" class="w-full px-4 py-2 border rounded-xl" />
                        <input type="email" name="email" placeholder="Email" class="w-full px-4 py-2 border rounded-xl" />
                        <textarea name="notes" placeholder="Notas..." class="w-full px-4 py-2 border rounded-xl"></textarea>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="button" id="closeModal" class="flex-1 py-2 bg-gray-100 rounded-xl font-bold">Cancelar</button>
                            <button type="submit" class="flex-1 py-2 bg-[#d4a373] text-white rounded-xl font-bold">Guardar</button>
                        </div>
                    </form>
                </div>
             </div>
        `;

        lucide.createIcons();

        // Attach Listeners
        document.getElementById('searchInput').addEventListener('input', (e) => {
            searchTerm = e.target.value;
            render();
            // Focus back after re-render (naive approach, better to diff DOM but acceptable for VanJS)
            const input = document.getElementById('searchInput');
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        });

        document.getElementById('newClientBtn').addEventListener('click', () => {
            document.getElementById('modalOverlay').classList.remove('hidden');
            document.getElementById('modalOverlay').classList.add('flex');
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('modalOverlay').classList.add('hidden');
            document.getElementById('modalOverlay').classList.remove('flex');
        });

        document.getElementById('clientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            store.addClient({
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                notes: formData.get('notes')
            });
            render(); // Close modal logic inside render or just re-render clears it? 
            // Better to re-render to state update and close modal manually
            document.getElementById('modalOverlay').classList.add('hidden');
            document.getElementById('modalOverlay').classList.remove('flex');
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar cliente?')) {
                    store.deleteClient(parseInt(btn.getAttribute('data-id')));
                    render();
                }
            });
        });
    };

    // Initial Render
    render();

    // Subscribe to store changes to auto-update view?
    // For now we trigger re-renders manually on actions within this component or use subscribe
    // store.subscribe(render); // Careful with infinite loops or losing focus
};
