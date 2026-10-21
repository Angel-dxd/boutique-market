/**
 * boutique/calendar.js
 * Módulo de agenda y calendario para la Boutique.
 * Gestiona citas, importación de CSV y reportes de ganancias.
 */
import { api } from '../core/api.js';
import { showConfirm } from '../shared/modal.js';
import { renderSkeleton } from '../shared/ui.js';

/**
 * Renderiza la interfaz de la agenda/calendario.
 * @param {HTMLElement} container - El elemento donde se inyectará el HTML.
 */
export const renderCalendar = async (container) => {
    let currentDate = new Date();
    let selectedDate = null;
    let appointmentModalOpen = false;
    let appointments = [];
    let globalClients = [];
    let earningsReport = { hoy: 0, mes: 0, ano: 0 };

    const cachedAppointmentsKey = `cached_appointments_${localStorage.getItem('currentUser') || 'default'}`;
    const cachedEarningsKey = `cached_earnings_${localStorage.getItem('currentUser') || 'default'}`;

    // Cargar datos cacheados primero (SWR)
    try {
        const cachedApts = localStorage.getItem(cachedAppointmentsKey);
        const cachedEarn = localStorage.getItem(cachedEarningsKey);
        if (cachedApts) appointments = JSON.parse(cachedApts);
        if (cachedEarn) earningsReport = JSON.parse(cachedEarn);
    } catch (e) {
        console.error("Error al leer caché del calendario", e);
    }

    const loadData = async () => {
        // Cargar calendarEvents
        const resAppointments = await api.get('/calendar/appointments');
        if (!resAppointments.error) {
            appointments = (resAppointments.calendarEvents || []).map(cita => ({
                id: cita.id,
                client: cita.client,
                date: cita.date,
                time: cita.description || '10:00',
                price: cita.profit
            }));
        } else {
            appointments = [];
        }

        // Cargar reporte de ganancias (Dashboard Agrupado)
        const dateParam = selectedDate ? formatDate(selectedDate) : formatDate(currentDate);
        const resEarnings = await api.get(`/calendar/earnings?date=${dateParam}`);
        if (!resEarnings.error) {
            earningsReport = resEarnings;
        }

        // Guardar en caché
        try {
            localStorage.setItem(cachedAppointmentsKey, JSON.stringify(appointments));
            localStorage.setItem(cachedEarningsKey, JSON.stringify(earningsReport));
        } catch (e) {
            console.error("Error al guardar caché del calendario", e);
        }
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const safeRender = () => {
        const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        const daysInMonth = getDaysInMonth(currentDate);
        const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;

        const getMetrics = (dateStr) => {
            const dailyApts = appointments.filter(a => a.date === dateStr);
            const revenue = dailyApts.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
            return { revenue, count: dailyApts.length, apts: dailyApts };
        };

        const detailMetrics = selectedDateStr ? getMetrics(selectedDateStr) : { revenue: 0, count: 0, apts: [] };

        container.innerHTML = `
            <div style="display: flex !important; flex-direction: column !important; width: 100% !important;" class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <!-- Header -->
                <div class="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center bg-white gap-4 z-10 w-full">
                    <div class="flex items-center gap-4">
                        <h2 class="text-xl font-bold text-gray-800 capitalize">${monthName}</h2>
                        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button id="prevMonth" class="p-1 hover:bg-white rounded shadow-sm transition-colors"><i data-lucide="chevron-left" width="20"></i></button>
                            <button id="nextMonth" class="p-1 hover:bg-white rounded shadow-sm transition-colors"><i data-lucide="chevron-right" width="20"></i></button>
                        </div>
                    </div>

                    <!-- Reporte de Ganancias (Centrado) -->
                    <div class="hidden lg:flex gap-6 items-center bg-gray-50 px-6 py-2 rounded-xl border border-gray-100">
                        <div class="text-center pr-6 border-r border-gray-200">
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Día Hoy</p>
                            <p class="text-sm font-bold text-emerald-600">${earningsReport.today || 0}€</p>
                        </div>
                        <div class="text-center pr-6 border-r border-gray-200">
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Este Mes</p>
                            <p class="text-sm font-bold text-blue-600">${earningsReport.month || 0}€</p>
                        </div>
                        <div class="text-center">
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Este Año</p>
                            <p class="text-sm font-bold text-purple-600">${earningsReport.year || 0}€</p>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <button id="importCalendarBtn" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 text-sm font-bold border border-blue-200 transition-colors">
                            <i data-lucide="upload" width="16"></i> <span class="hidden md:inline">Importar CSV</span>
                        </button>
                        <input type="file" id="importCalendarInput" accept=".csv" class="hidden" />

                        <button id="newAptBtn" class="px-4 py-2 bg-[#059669] text-white rounded-lg hover:opacity-90 flex items-center gap-2 text-sm font-bold transition-all shadow-md active:scale-95">
                            <i data-lucide="calendar-plus" width="16"></i> Nueva 
                        </button>
                    </div>
                </div>

                <!-- Calendar Grid (Full Width) -->
                <div class="flex-1 overflow-y-auto relative w-full">
                    <!-- Sello de Versión -->
                    <div class="absolute top-0 right-0 p-1 text-[8px] text-gray-300 pointer-events-none z-50">v1.1.1-layout-fixed</div>
                    
                    <div class="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 w-full">
                        ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => `<div class="py-2 text-center text-xs font-bold text-gray-500">${d}</div>`).join('')}
                    </div>
                    <div class="grid grid-cols-7 auto-rows-fr w-full">
                        <!-- Celdas vacías -->
                        ${(() => {
                            let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                            const offset = firstDay === 0 ? 6 : firstDay - 1;
                            return Array.from({ length: offset }).map(() => `
                                <div class="border-b border-r border-gray-50 bg-gray-50/10"></div>
                            `).join('');
                        })()}

                        ${daysArray.map(day => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dateStr = formatDate(date);
                            const metrics = getMetrics(dateStr);
                            const isSelected = selectedDateStr === dateStr;
                            const isToday = formatDate(new Date()) === dateStr;
                
                            return `
                                <div class="day-cell border-b border-r border-gray-100 min-h-[80px] p-2 relative cursor-pointer ${isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-200' : 'bg-white'} hover:bg-gray-50 transition-colors" data-date="${dateStr}">
                                    <div class="flex justify-between items-start">
                                        <span class="text-xs font-bold ${isToday ? 'bg-emerald-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : (isSelected ? 'text-emerald-600' : 'text-gray-700')}">${day}</span>
                                        ${metrics.revenue > 0 ? `<span class="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-lg font-black">${metrics.revenue}€</span>` : ''}
                                    </div>
                                    <div class="mt-2 flex flex-wrap gap-1">
                                         ${Array.from({ length: Math.min(metrics.count, 4) }).map(() => `<div class="w-2 h-2 rounded-full bg-emerald-400/60"></div>`).join('')}
                                    </div>
                                </div>
                             `;
                        }).join('')}
                    </div>
                </div>

                <!-- Sidebar Details -->
                ${selectedDate ? `
                    <div class="absolute top-0 right-0 h-full w-full md:w-80 bg-white shadow-xl z-20 flex flex-col p-6 border-l border-gray-100 animate-in slide-in-from-right">
                         <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-gray-800 text-lg">Citas del Día</h3>
                            <button id="closeDetails" class="hover:bg-gray-100 p-1 rounded-full transition-colors"><i data-lucide="x" width="20"></i></button>
                        </div>
                        
                        <!-- Metrics -->
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-emerald-50 p-4 rounded-xl text-center">
                                <p class="text-xs text-emerald-600 font-bold uppercase">Facturación</p>
                                <p class="text-2xl font-black text-emerald-700">${detailMetrics.revenue}€</p>
                            </div>
                            <div class="bg-blue-50 p-4 rounded-xl text-center">
                                <p class="text-xs text-blue-600 font-bold uppercase">Visitas</p>
                                <p class="text-xl font-bold text-blue-700">${detailMetrics.count}</p>
                            </div>
                        </div>

                         <!-- Notes (Cleanup Applied) -->
                        <textarea id="dailyNote" class="hidden w-full p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm" placeholder="Añadir notas del día..."></textarea>
                        
                        <!-- List -->
                        <div class="space-y-2 flex-1 overflow-y-auto pr-2">
                            ${detailMetrics.apts.map(apt => `
                                <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-gray-800 text-sm">${apt.client}</span>
                                        <span class="text-xs font-medium text-gray-500">${apt.time}</span>
                                    </div>
                                    <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-sm">${apt.price}€</span>
                                </div>
                            `).join('')}
                            ${detailMetrics.apts.length === 0 ? '<p class="text-sm text-gray-400 text-center mt-6">No hay calendarEvents registradas para este día.</p>' : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- New Appointment Modal with Autocomplete -->
                <div id="aptModal" class="absolute inset-0 z-50 bg-gray-900/40 backdrop-blur-sm ${appointmentModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <h3 class="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2"><i data-lucide="calendar-plus" class="text-emerald-600"></i> Agendar Cita</h3>
                        
                        <form id="aptForm" novalidate>
                            <div class="space-y-4">
                                <div class="relative">
                                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Buscar Cliente</label>
                                    <input name="client" id="aptClientInput" autocomplete="off" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800" placeholder="Ej. Mariana López" required />
                                    <!-- Custom Autocomplete Dropdown -->
                                    <div id="autocompleteDropdown" class="hidden absolute z-10 w-full mt-1 bg-white shadow-xl rounded-xl border border-gray-100 max-h-48 overflow-y-auto"></div>
                                </div>
                                
                                <div id="clientContactFields" class="grid grid-cols-2 gap-4 transition-all duration-300 overflow-hidden">
                                     <div>
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
                                        <input name="phone" id="aptPhoneInput" type="tel" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800" placeholder="600000000" />
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                                        <input name="email" id="aptEmailInput" type="email" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800" placeholder="correo@ejemplo.com" />
                                    </div>
                                </div>

                                <div class="flex gap-2 sm:gap-4">
                                    <div class="flex-[3] min-w-0">
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</label>
                                        <input name="date" type="date" id="aptDate" class="w-full mt-1 px-2 py-3 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-[13px] sm:text-sm font-medium min-w-0" required />
                                    </div>
                                    <div class="flex-[2] min-w-0">
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Hora</label>
                                        <select name="time" class="w-full mt-1 px-2 py-3 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-[13px] sm:text-sm font-medium min-w-0">
                                            <option value="09:00">09:00</option>
                                            <option value="10:00" selected>10:00</option>
                                            <option value="11:00">11:00</option>
                                            <option value="12:00">12:00</option>
                                            <option value="13:00">13:00</option>
                                            <option value="14:00">14:00</option>
                                            <option value="15:00">15:00</option>
                                            <option value="16:00">16:00</option>
                                            <option value="17:00">17:00</option>
                                            <option value="18:00">18:00</option>
                                            <option value="19:00">19:00</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Costo del servicio</label>
                                    <div class="relative mt-1">
                                        <span class="absolute left-3 top-3 text-gray-400 font-bold">€</span>
                                        <input name="price" type="number" step="0.01" placeholder="0.00" class="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold text-gray-800" required />
                                    </div>
                                </div>
                            </div>
                            
                             <div class="flex gap-3 mt-8">
                                <button type="button" id="closeAptModal" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors">Cancelar</button>
                                <button type="submit" class="flex-1 py-3 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        // Handlers
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            currentDate = new Date(currentDate);
            safeRender();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            currentDate = new Date(currentDate);
            safeRender();
        });

        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('click', async () => {
                const dateStr = cell.getAttribute('data-date');
                selectedDate = new Date(dateStr);
                // Trigger reload to fetch the contextual earnings for that date explicitly? 
                // Currently earnings fetch happens globally inside loadData. Let's just swap state.
                await loadData();
                safeRender();
            });
        });

        if (selectedDate) {
            document.getElementById('closeDetails')?.addEventListener('click', () => {
                selectedDate = null;
                safeRender();
            });
        }

        document.getElementById('newAptBtn').addEventListener('click', () => {
            appointmentModalOpen = true;
            safeRender();

            setTimeout(() => {
                const dateInput = document.getElementById('aptDate');
                if (dateInput) dateInput.value = formatDate(selectedDate || new Date());
            }, 0);
        });

        if (appointmentModalOpen) {
            // Cargar clientes de forma diferida para alimentar el autocompletado
            if (globalClients.length === 0) {
                api.get('/clients').then(resClients => {
                    if (!resClients.error && Array.isArray(resClients.data)) {
                        globalClients = resClients.data;
                    }
                });
            }

            document.getElementById('closeAptModal').addEventListener('click', () => {
                appointmentModalOpen = false;
                safeRender();
            });

            // Autocomplete listener
            const aptClientInput = document.getElementById('aptClientInput');
            const dropdown = document.getElementById('autocompleteDropdown');
            if (aptClientInput && dropdown) {
                // Ocultar dropdown al hacer click fuera
                document.addEventListener('click', (e) => {
                    if (!aptClientInput.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.add('hidden');
                    }
                });

                aptClientInput.addEventListener('input', (e) => {
                    // Si el usuario escribe algo, mostramos los campos de contacto asumiendo que puede ser alguien nuevo
                    const contactFields = document.getElementById('clientContactFields');
                    if (contactFields) contactFields.classList.remove('hidden');

                    const typedName = e.target.value.toLowerCase().trim();
                    if (typedName.length === 0) {
                        dropdown.classList.add('hidden');
                        return;
                    }

                    // Filtrar clientes
                    const matches = globalClients.filter(c => 
                        (c.name && c.name.toLowerCase().includes(typedName)) ||
                        (c.phone && c.phone.includes(typedName)) ||
                        (c.email && c.email.toLowerCase().includes(typedName))
                    );

                    if (matches.length > 0) {
                        dropdown.innerHTML = matches.map(c => `
                            <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 autocomplete-item"
                                 data-name="${c.name || ''}" data-phone="${c.phone || ''}" data-email="${c.email || ''}">
                                <p class="font-bold text-sm text-gray-800">${c.name}</p>
                                <p class="text-xs text-gray-500 flex gap-2">
                                    ${c.phone ? `<span><i data-lucide="phone" width="10" class="inline"></i> ${c.phone}</span>` : ''}
                                    ${c.email ? `<span><i data-lucide="mail" width="10" class="inline"></i> ${c.email}</span>` : ''}
                                </p>
                            </div>
                        `).join('');
                        dropdown.classList.remove('hidden');
                        lucide.createIcons({ root: dropdown });

                        // Eventos para click en el item
                        dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                            item.addEventListener('click', () => {
                                aptClientInput.value = item.getAttribute('data-name');
                                document.getElementById('aptPhoneInput').value = item.getAttribute('data-phone');
                                document.getElementById('aptEmailInput').value = item.getAttribute('data-email');
                                dropdown.classList.add('hidden');
                                
                                // Ocultar los campos de teléfono y email porque ya es un cliente existente
                                const contactFields = document.getElementById('clientContactFields');
                                if (contactFields) contactFields.classList.add('hidden');
                            });
                        });
                    } else {
                        dropdown.classList.add('hidden');
                    }
                });
            }

            document.getElementById('aptForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const clientName = formData.get('client');
                const phone = formData.get('phone');
                const email = formData.get('email');

                api.showLoading();
                try {
                    let clientRes;
                    const existingClient = globalClients.find(c => c.name && c.name.toLowerCase() === clientName.toLowerCase());
                    if (existingClient) {
                        clientRes = await api.put(`/clients/${existingClient.id}`, { name: clientName, phone, email, notes: existingClient.notes || '', force: true });
                    } else {
                        clientRes = await api.post('/clients', { name: clientName, phone, email, notes: '', force: true });
                    }

                    // Verificar si hubo error de validación (ahora api.js devuelve el error en la propiedad error directamente)
                    if (clientRes.error) {
                        api.showToast(clientRes.error, true);
                        return; // Detenemos la creación de la cita si el cliente es inválido
                    }

                    // Save the Appointment
                    const response = await api.post('/calendar/appointments', {
                        client: clientName,
                        description: formData.get('time'),
                        profit: parseFloat(formData.get('price')),
                        date: formData.get('date') || formatDate(selectedDate || new Date())
                    });

                    if (!response.error) {
                        appointmentModalOpen = false;
                        await loadData(); // this also auto updates earnings module
                        safeRender();
                        api.showToast('Cita guardada correctamente');
                    } else {
                        api.showToast('Error al guardar la cita', true);
                    }
                } finally {
                    api.hideLoading();
                }
            });
        }

        // CSV Import Logic
        const importBtn = document.getElementById('importCalendarBtn');
        const importInput = document.getElementById('importCalendarInput');
        if (importBtn && importInput) {
            importBtn.onclick = () => importInput.click();
            importInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (event) => {
                    const csv = event.target.result;
                    const lines = csv.split('\n');
                    const appointmentsToImport = [];

                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i];
                        if (!line.trim()) continue;

                        // Parse CSV preserving quotes
                        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                        const cols = matches ? matches.map(m => m.replace(/^"|"$/g, '').trim()) : line.split(',');

                        if (cols.length >= 2) {
                            appointmentsToImport.push({
                                client: cols[0],
                                date: cols[1], // Expecting YYYY-MM-DD
                                description: cols[2] || '10:00', // Time or details
                                profit: cols[3] ? parseFloat(cols[3]) : 0
                            });
                        }
                    }

                    if (appointmentsToImport.length > 0) {
                        api.showLoading();
                        const response = await api.post('/calendar/appointments/bulk', { appointments: appointmentsToImport });
                        api.hideLoading();

                        if (!response.error) {
                            api.showToast(`Se importaron ${appointmentsToImport.length} calendarEvents`, 'success');
                            await loadData();
                            safeRender();
                        }
                    } else {
                        api.showToast('El archivo CSV está vacío o el formato es incorrecto.', 'error');
                    }
                };
                reader.readAsText(file);
                e.target.value = ''; // Reset
            };
        }
    };

    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="p-4 md:p-8 w-full max-w-7xl mx-auto">
                <h1 class="text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100 mb-8">Agenda</h1>
                ${renderSkeleton('calendar')}
            </div>
        `;
    } else {
        safeRender();
    }

    await loadData();
    safeRender();
};
