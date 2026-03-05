import { api } from '../../api.js';

export const renderCalendar = async (container) => {
    let currentDate = new Date();
    let selectedDate = null;
    let appointmentModalOpen = false;
    let appointments = [];
    let globalClients = [];
    let earningsReport = { hoy: 0, mes: 0, ano: 0 };

    const loadData = async () => {
        // Cargar citas
        const resAppointments = await api.get('/calendar/appointments');
        if (!resAppointments.error) {
            appointments = (resAppointments.citas || []).map(cita => ({
                id: cita.id,
                client: cita.cliente,
                date: cita.fecha,
                time: cita.descripcion || '10:00',
                price: cita.ganancia
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

        // Cargar todos los clientes para el Autocompletado del Input
        const resClients = await api.get('/clients');
        if (!resClients.error && Array.isArray(resClients)) {
            globalClients = resClients;
        }
    };

    const formatDate = (date) => date.toISOString().split('T')[0];
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
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <!-- Header -->
                <div class="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center bg-white gap-4">
                    <div class="flex items-center gap-4">
                        <h2 class="text-xl font-bold text-gray-800 capitalize">${monthName}</h2>
                        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button id="prevMonth" class="p-1 hover:bg-white rounded shadow-sm"><i data-lucide="chevron-left" width="20"></i></button>
                            <button id="nextMonth" class="p-1 hover:bg-white rounded shadow-sm"><i data-lucide="chevron-right" width="20"></i></button>
                        </div>
                    </div>

                    <!-- Módulo de Informes de Ganancias Diarias/Mensuales/Anuales -->
                    <div class="hidden lg:flex gap-6 mx-auto items-center bg-gray-50 px-6 py-2 rounded-xl">
                        <div class="text-center pr-6 border-r border-gray-200">
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Día Hoy</p>
                            <p class="text-sm font-bold text-emerald-600">${earningsReport.hoy}€</p>
                        </div>
                        <div class="text-center pr-6 border-r border-gray-200">
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Este Mes</p>
                            <p class="text-sm font-bold text-blue-600">${earningsReport.mes}€</p>
                        </div>
                        <div class="text-center">
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Este Año</p>
                            <p class="text-sm font-bold text-purple-600">${earningsReport.ano}€</p>
                        </div>
                    </div>

                    <div class="flex gap-2 ml-auto">
                        <button id="importCalendarBtn" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 text-sm font-bold border border-blue-200 transition-colors">
                            <i data-lucide="upload" width="16"></i> <span class="hidden md:inline">Importar CSV</span>
                        </button>
                        <input type="file" id="importCalendarInput" accept=".csv" class="hidden" />

                        <button id="newAptBtn" class="px-4 py-2 bg-[#059669] text-white rounded-lg hover:opacity-90 flex items-center gap-2 text-sm font-bold transition-opacity shadow-md">
                            <i data-lucide="calendar-plus" width="16"></i> Nueva 
                        </button>
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="flex-1 overflow-y-auto">
                    <div class="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                        ${['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => `<div class="py-2 text-center text-xs font-bold text-gray-500">${d}</div>`).join('')}
                    </div>
                    <div class="grid grid-cols-7 auto-rows-fr">
                         ${daysArray.map(day => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = formatDate(date);
            const metrics = getMetrics(dateStr);
            const isSelected = selectedDateStr === dateStr;

            return `
                                <div class="day-cell border-b border-r border-gray-100 min-h-[80px] p-2 relative cursor-pointer ${isSelected ? 'bg-orange-50' : 'bg-white'} hover:bg-gray-50 transition-colors" data-date="${dateStr}">
                                    <div class="flex justify-between items-start">
                                        <span class="text-xs font-bold ${isSelected ? 'text-orange-600' : 'text-gray-700'}">${day}</span>
                                        ${metrics.revenue > 0 ? `<span class="text-[10px] bg-emerald-50 text-emerald-600 px-1 rounded font-bold">${metrics.revenue}€</span>` : ''}
                                    </div>
                                    <div class="mt-1 flex flex-wrap gap-1">
                                         ${Array.from({ length: Math.min(metrics.count, 5) }).map(() => `<div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>`).join('')}
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
                            ${detailMetrics.apts.length === 0 ? '<p class="text-sm text-gray-400 text-center mt-6">No hay citas registradas para este día.</p>' : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- New Appointment Modal with Autocomplete -->
                <div id="aptModal" class="absolute inset-0 z-50 bg-gray-900/40 backdrop-blur-sm ${appointmentModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <h3 class="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2"><i data-lucide="calendar-plus" class="text-emerald-600"></i> Agendar Cita</h3>
                        
                        <form id="aptForm">
                            <!-- Datalist Autocomplete integration -->
                            <datalist id="clientsList">
                                ${globalClients.map(c => `<option value="${c.name || ''}"></option>`).join('')}
                            </datalist>

                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Busca o escribe cliente</label>
                                    <input name="client" id="aptClientInput" list="clientsList" autocomplete="off" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800" placeholder="Ej. Mariana López" required />
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                     <div>
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
                                        <input name="phone" id="aptPhoneInput" type="tel" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800" placeholder="600000000" />
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                                        <input name="email" id="aptEmailInput" type="email" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800" placeholder="correo@ejemplo.com" />
                                    </div>
                                </div>

                                <div class="flex gap-4">
                                    <div class="flex-1">
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</label>
                                        <input name="date" type="date" id="aptDate" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium" required />
                                    </div>
                                    <div class="w-24">
                                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Hora</label>
                                        <select name="time" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium">
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
            if (!selectedDate) selectedDate = new Date();
            appointmentModalOpen = true;
            safeRender();

            setTimeout(() => {
                const dateInput = document.getElementById('aptDate');
                if (dateInput) dateInput.value = formatDate(selectedDate);
            }, 0);
        });

        if (appointmentModalOpen) {
            document.getElementById('closeAptModal').addEventListener('click', () => {
                appointmentModalOpen = false;
                safeRender();
            });

            // Autocomplete listener
            const aptClientInput = document.getElementById('aptClientInput');
            if (aptClientInput) {
                aptClientInput.addEventListener('input', (e) => {
                    const typedName = e.target.value;
                    const match = globalClients.find(c => c.name && c.name.toLowerCase() === typedName.toLowerCase());
                    if (match) {
                        document.getElementById('aptPhoneInput').value = match.phone || '';
                        document.getElementById('aptEmailInput').value = match.email || '';
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
                    const existingClient = globalClients.find(c => c.name && c.name.toLowerCase() === clientName.toLowerCase());
                    if (existingClient) {
                        await api.put(`/clients/${existingClient.id}`, { name: clientName, phone, email, notes: existingClient.notes || '' });
                    } else {
                        await api.post('/clients', { name: clientName, phone, email, notes: '' });
                    }

                    // Save the Appointment
                    const response = await api.post('/calendar/appointments', {
                        cliente: clientName,
                        descripcion: formData.get('time'),
                        ganancia: parseFloat(formData.get('price')),
                        fecha: formData.get('date') || formatDate(selectedDate)
                    });

                    if (!response.error) {
                        appointmentModalOpen = false;
                        await loadData(); // this also auto updates earnings module
                        safeRender();
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
                                cliente: cols[0],
                                fecha: cols[1], // Expecting YYYY-MM-DD
                                descripcion: cols[2] || '10:00', // Time or details
                                ganancia: cols[3] ? parseFloat(cols[3]) : 0
                            });
                        }
                    }

                    if (appointmentsToImport.length > 0) {
                        api.showLoading();
                        const response = await api.post('/calendar/appointments/bulk', { appointments: appointmentsToImport });
                        api.hideLoading();

                        if (!response.error) {
                            api.showToast(`Se importaron ${appointmentsToImport.length} citas`, 'success');
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

    await loadData();
    safeRender();
};
