/**
 * boutique/clients.js
 * Módulo de gestión de clientas para la Boutique.
 * Gestiona el listado, alta, baja (soft delete) y panel de fidelización.
 */
import { api } from '../core/api.js';
import { showConfirm } from '../shared/modal.js';
import { renderSkeleton } from '../shared/ui.js';

/**
 * Renderiza la interfaz de gestión de clientas.
 * @param {HTMLElement} container - El elemento donde se inyectará el HTML.
 */
export const renderClients = async (container) => {
    let clients = [];
    let atRiskClients = [];
    let isModalOpen = false;
    let editingId = null;
    let activeTab = 'all'; // 'all' | 'at-risk'

    let isHistoryModalOpen = false;
    let selectedClientForHistory = null;
    let clientDesigns = [];

    const cachedClientsKey = `cached_clients_${localStorage.getItem('currentUser') || 'default'}`;
    const cachedAtRiskKey = `cached_atrisk_${localStorage.getItem('currentUser') || 'default'}`;

    // Cargar datos cacheados primero (SWR)
    try {
        const cachedClients = localStorage.getItem(cachedClientsKey);
        const cachedAtRisk = localStorage.getItem(cachedAtRiskKey);
        if (cachedClients) clients = JSON.parse(cachedClients);
        if (cachedAtRisk) atRiskClients = JSON.parse(cachedAtRisk);
    } catch (e) {
        console.error("Error al leer caché de clientas", e);
    }

    const openHistoryModal = async (client) => {
        selectedClientForHistory = client;
        const res = await api.get(`/gallery?client_id=${client.id}&limit=100`);
        clientDesigns = res.error ? [] : (res || []);
        isHistoryModalOpen = true;
        safeRender();
    };

    const closeHistoryModal = () => {
        isHistoryModalOpen = false;
        selectedClientForHistory = null;
        clientDesigns = [];
        safeRender();
    };

    const loadData = async () => {
        const [clientsRes, atRiskRes] = await Promise.all([
            api.get('/clients'),
            api.get('/clients/at-risk?days=30')
        ]);
        clients = clientsRes.error ? [] : (clientsRes.data || []);
        atRiskClients = atRiskRes.error ? [] : (atRiskRes.data || []);
        
        // Guardar en caché
        try {
            localStorage.setItem(cachedClientsKey, JSON.stringify(clients));
            localStorage.setItem(cachedAtRiskKey, JSON.stringify(atRiskClients));
        } catch (e) {
            console.error("Error al guardar caché de clientas", e);
        }
    };

    const getEditingClient = () => clients.find(c => c.id === editingId) || null;

    const getRiskStyle = (days) => {
        if (days >= 60) return { color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', label: 'Crítica', dot: 'bg-red-500' };
        if (days >= 45) return { color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', label: 'En riesgo', dot: 'bg-amber-500' };
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', label: 'Inactiva', dot: 'bg-yellow-400' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const safeRender = () => {
        const editing = getEditingClient();

        container.innerHTML = `
            <div class="p-4 md:p-8 w-full max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-2">
                    <h1 class="text-2xl md:text-3xl font-black text-gray-800">Clientas</h1>
                    <button id="addClientBtn"
                        class="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200">
                        <i data-lucide="user-plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span class="hidden sm:inline">Nueva Clienta</span><span class="sm:hidden">Nueva</span>
                    </button>
                </div>
                <p class="text-gray-400 font-medium mb-8">Gestión de clientas recurrentes de Oh-Nails</p>

                <!-- KPIs -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div class="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Total clientas</p>
                            <p class="text-3xl font-black text-gray-800 dark:text-gray-100 mt-1">${clients.length}</p>
                        </div>
                        <div class="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><i data-lucide="users" width="24"></i></div>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                        id="atRiskCard">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Sin visita +30 días</p>
                            <p class="text-3xl font-black ${atRiskClients.length > 0 ? 'text-amber-500' : 'text-gray-800'} mt-1">${atRiskClients.length}</p>
                        </div>
                        <div class="p-3 ${atRiskClients.length > 0 ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400'} rounded-2xl">
                            <i data-lucide="bell-ring" width="24"></i>
                        </div>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Clientas activas</p>
                            <p class="text-3xl font-black text-emerald-600 mt-1">${clients.length - atRiskClients.length}</p>
                        </div>
                        <div class="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><i data-lucide="heart" width="24"></i></div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex flex-wrap gap-2 mb-6">
                    <button data-tab="all"
                        class="tab-btn px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-colors ${activeTab === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}">
                        Todas (${clients.length})
                    </button>
                    <button data-tab="at-risk"
                        class="tab-btn px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-colors ${activeTab === 'at-risk' ? 'bg-amber-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}">
                        <span class="flex items-center gap-2">
                            <i data-lucide="alert-circle" width="14"></i>
                            Requieren atención (${atRiskClients.length})
                        </span>
                    </button>
                </div>

                <!-- Panel fidelización -->
                ${activeTab === 'at-risk' ? `
                <div class="bg-amber-50 border border-amber-100 rounded-3xl p-6 mb-6">
                    <div class="flex items-start gap-3 mb-4">
                        <div class="p-2 bg-amber-100 text-amber-600 rounded-xl mt-0.5">
                            <i data-lucide="bell-ring" width="20"></i>
                        </div>
                        <div>
                            <h3 class="font-black text-amber-800">Panel de Fidelización</h3>
                            <p class="text-amber-600 text-sm mt-1">Estas clientas llevan más de 30 días sin visita. Contactarlas puede recuperar ingresos recurrentes.</p>
                        </div>
                    </div>
                    ${atRiskClients.length === 0 ? `
                        <div class="text-center py-8 text-amber-600 font-medium">
                            <i data-lucide="check-circle" width="32" class="mx-auto mb-2 text-emerald-500"></i>
                            <p class="text-emerald-700 font-bold">¡Todas las clientas han visitado recientemente!</p>
                        </div>
                    ` : atRiskClients.map(c => {
            const style = getRiskStyle(c.days_since_visit);
            return `
                        <div class="bg-white rounded-2xl p-4 mb-3 flex items-center justify-between shadow-sm border border-amber-100">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-black text-sm">
                                    ${c.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p class="font-bold text-gray-800">${c.name}</p>
                                    <p class="text-sm text-gray-400">${c.phone || 'Sin teléfono'} · Última visita: ${formatDate(c.last_visit)}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.badge}">
                                    <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
                                    ${c.days_since_visit} días · ${style.label}
                                </span>
                                ${c.phone ? `
                                <a href="https://wa.me/34${c.phone.replace(/\D/g, '')}" target="_blank"
                                    class="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors">
                                    <i data-lucide="message-circle" width="14"></i> WhatsApp
                                </a>` : ''}
                            </div>
                        </div>`;
        }).join('')}
                </div>` : ''}

                <!-- Lista de clientas -->
                <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
                                    <th class="px-6 py-4 text-left font-bold">Nombre</th>
                                    <th class="px-6 py-4 text-left font-bold">Teléfono</th>
                                    <th class="px-6 py-4 text-left font-bold">Email</th>
                                    <th class="px-6 py-4 text-left font-bold">Última visita</th>
                                    <th class="px-6 py-4 text-left font-bold">Notas</th>
                                    <th class="px-6 py-4 text-center font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                ${clients.length === 0
                ? `<tr><td colspan="6" class="text-center py-16 text-gray-400 font-medium">No hay clientas registradas.</td></tr>`
                : clients.map(c => `
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-black text-xs">
                                                    ${c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span class="font-semibold text-gray-800">${c.name}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-gray-500">${c.phone || '—'}</td>
                                        <td class="px-6 py-4 text-gray-500">${c.email || '—'}</td>
                                        <td class="px-6 py-4 text-gray-500">${formatDate(c.last_visit)}</td>
                                        <td class="px-6 py-4 text-gray-400 max-w-xs truncate">${c.notes || '—'}</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center justify-center gap-2">
                                                <button data-history="${c.id}"
                                                    class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="Historial de Diseños">
                                                    <i data-lucide="image" width="16"></i>
                                                </button>
                                                <button data-edit="${c.id}"
                                                    class="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors" title="Editar">
                                                    <i data-lucide="pencil" width="16"></i>
                                                </button>
                                                <button data-delete="${c.id}"
                                                    class="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar">
                                                    <i data-lucide="trash-2" width="16"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
 
                <!-- Modal crear / editar -->
                ${isModalOpen ? `
                <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div class="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 class="text-lg md:text-xl font-black text-gray-800">${editingId ? 'Editar Clienta' : 'Nueva Clienta'}</h2>
                            <button id="closeModal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <i data-lucide="x" width="20"></i>
                            </button>
                        </div>
                        <form id="clientForm" class="p-6 md:p-8 space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Nombre *</label>
                                <input name="name" required value="${editing?.name || ''}"
                                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    placeholder="Nombre completo" />
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                                <input name="phone" value="${editing?.phone || ''}"
                                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    placeholder="Ej: 612345678" />
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input name="email" type="email" value="${editing?.email || ''}"
                                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    placeholder="ejemplo@email.com" />
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Notas</label>
                                <textarea name="notes" rows="3"
                                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    placeholder="Preferencias, alergias, observaciones...">${editing?.notes || ''}</textarea>
                            </div>
                            <div class="pt-4 flex gap-3">
                                <button type="button" id="cancelBtn"
                                    class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200">
                                    ${editingId ? 'Guardar cambios' : 'Crear clienta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>` : ''}

                <!-- Modal Historial de Diseños -->
                ${isHistoryModalOpen && selectedClientForHistory ? `
                <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div class="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 flex-shrink-0">
                            <div>
                                <h2 class="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
                                    <i data-lucide="image" class="text-emerald-500 w-6 h-6"></i>
                                    Diseños de ${selectedClientForHistory.name}
                                </h2>
                                <p class="text-xs text-gray-400 mt-1 font-medium">Historial fotográfico de manicuras</p>
                            </div>
                            <button id="closeHistoryModal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <i data-lucide="x" width="20"></i>
                            </button>
                        </div>
                        
                        <div class="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                            ${clientDesigns.length === 0 ? `
                                <div class="text-center py-12 text-gray-400">
                                    <div class="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i data-lucide="image-off" class="w-8 h-8"></i>
                                    </div>
                                    <p class="font-bold text-gray-600">No hay diseños registrados aún</p>
                                    <p class="text-xs text-gray-400 mt-1">Puedes vincular fotos a esta clienta desde el catálogo de "Mis Uñas".</p>
                                </div>
                            ` : `
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    ${clientDesigns.map(design => `
                                        <div class="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <img src="${design.image}" alt="${design.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <span class="text-xs font-bold text-white line-clamp-1">${design.title}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                        
                        <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
                            <button id="btnVerGaleria" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-emerald-100">
                                Ir a Galería de Uñas
                            </button>
                        </div>
                    </div>
                </div>` : ''}
            </div>
        `;

        lucide.createIcons();
        bindEvents();
    };

    const bindEvents = () => {
        document.getElementById('addClientBtn')?.addEventListener('click', () => {
            editingId = null;
            isModalOpen = true;
            safeRender();
        });

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

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.getAttribute('data-tab');
                safeRender();
            });
        });

        // Card de riesgo → cambia a tab at-risk
        document.getElementById('atRiskCard')?.addEventListener('click', () => {
            activeTab = 'at-risk';
            safeRender();
        });

        // Editar
        document.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingId = parseInt(btn.getAttribute('data-edit'));
                isModalOpen = true;
                safeRender();
            });
        });

        // Eliminar
        document.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-delete'));
                const client = clients.find(c => c.id === id);
                const confirmed = await showConfirm(
                    'Eliminar Clienta',
                    `¿Eliminar a "${client?.name}"? Esta acción no se puede deshacer.`,
                    'Sí, eliminar',
                    'Cancelar'
                );
                if (!confirmed) return;

                 const res = await api.delete(`/clients/${id}`);
                 if (!res.error) {
                     await loadData();
                     safeRender();
                 } else {
                     api.showToast('Error al eliminar la clienta.', true);
                 }
             });
         });
        // Historial
        document.querySelectorAll('[data-history]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-history'));
                const client = clients.find(c => c.id === id);
                if (client) {
                    await openHistoryModal(client);
                }
            });
        });

        document.getElementById('closeHistoryModal')?.addEventListener('click', closeHistoryModal);
        document.getElementById('btnVerGaleria')?.addEventListener('click', () => {
            closeHistoryModal();
            window.navigateTo('/boutique/galeria');
        });

        // Submit formulario
        document.getElementById('clientForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get('name');
            const phone = formData.get('phone') || null;
            const email = formData.get('email') || null;
            let force = false;

            // Check duplicate locally
            const existingContact = clients.find(c => 
                (c.name && c.name.toLowerCase() !== name.toLowerCase() && c.id !== editingId) && 
                ((phone && c.phone === phone) || (email && c.email === email))
            );

            if (existingContact) {
                const confirmed = await showConfirm(
                    'Cliente Existente',
                    `Ya tienes una clienta (${existingContact.name}) registrada con ese mismo correo o teléfono. ¿Seguro que quieres añadirla de todos modos?`,
                    'Sí, añadir',
                    'Cancelar'
                );
                if (!confirmed) return;
                force = true;
            }

            const payload = {
                name,
                phone,
                email,
                notes: formData.get('notes') || null,
                force
            };

            const res = editingId
                ? await api.put(`/clients/${editingId}`, payload)
                : await api.post('/clients', payload);

            if (!res.error) {
                isModalOpen = false;
                editingId = null;
                await loadData();
                safeRender();
            } else {
                api.showToast(res.error, true);
            }
        });
    };

    if (clients.length === 0) {
        container.innerHTML = `
            <div class="p-4 md:p-8 w-full max-w-7xl mx-auto">
                <h1 class="text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100 mb-8">Clientas</h1>
                ${renderSkeleton('cards')}
                ${renderSkeleton('table')}
            </div>
        `;
    } else {
        safeRender();
    }

    await loadData();
    safeRender();
};