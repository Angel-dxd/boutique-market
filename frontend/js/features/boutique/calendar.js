import { store } from '../../store.js';

export const renderCalendar = (container) => {
    let currentDate = new Date();
    let selectedDate = null;
    let appointmentModalOpen = false;

    // Helper: Format Date YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Helper: Days in Month
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const render = () => {
        const state = store.getState();
        const appointments = state.appointments;
        const dailyNotes = state.dailyNotes;

        const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        const daysInMonth = getDaysInMonth(currentDate);
        const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;

        // Calculate Metrics for each day
        const getMetrics = (dateStr) => {
            const dailyApts = appointments.filter(a => a.date === dateStr);
            const revenue = dailyApts.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
            return { revenue, count: dailyApts.length, apts: dailyApts };
        };

        const detailMetrics = selectedDateStr ? getMetrics(selectedDateStr) : { revenue: 0, count: 0, apts: [] };
        const savedNote = selectedDateStr && dailyNotes[selectedDateStr] ? dailyNotes[selectedDateStr].content : '';

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] flex flex-col relative overflow-hidden">
                <!-- Header -->
                <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div class="flex items-center gap-4">
                        <h2 class="text-xl font-bold text-gray-800 capitalize">${monthName}</h2>
                        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button id="prevMonth" class="p-1 hover:bg-white rounded shadow-sm"><i data-lucide="chevron-left" width="20"></i></button>
                            <button id="nextMonth" class="p-1 hover:bg-white rounded shadow-sm"><i data-lucide="chevron-right" width="20"></i></button>
                        </div>
                    </div>
                    <button id="newAptBtn" class="px-4 py-2 bg-[#059669] text-white rounded-lg hover:opacity-90 flex items-center gap-2 text-sm font-bold">
                        <i data-lucide="calendar" width="16"></i> Nueva
                    </button>
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
            const hasNote = dailyNotes[dateStr]?.content;

            return `
                                <div class="day-cell border-b border-r border-gray-100 min-h-[80px] p-2 relative cursor-pointer ${isSelected ? 'bg-orange-50' : 'bg-white'}" data-date="${dateStr}">
                                    <div class="flex justify-between items-start">
                                        <span class="text-xs font-bold text-gray-700">${day}</span>
                                        ${metrics.revenue > 0 ? `<span class="text-[10px] bg-emerald-50 text-emerald-600 px-1 rounded font-bold">${metrics.revenue}€</span>` : ''}
                                    </div>
                                    <div class="mt-1 flex flex-wrap gap-1">
                                         ${Array.from({ length: Math.min(metrics.count, 5) }).map(() => `<div class="w-1.5 h-1.5 rounded-full bg-blue-300"></div>`).join('')}
                                    </div>
                                    ${hasNote ? `<i data-lucide="file-text" width="10" class="absolute bottom-1 right-1 text-orange-400"></i>` : ''}
                                </div>
                             `;
        }).join('')}
                    </div>
                </div>

                <!-- Sidebar Details (Overlay for small screens, side panel for large) -->
                ${selectedDate ? `
                    <div class="absolute top-0 right-0 h-full w-full md:w-80 bg-white shadow-xl z-20 flex flex-col p-6 border-l border-gray-100 animate-in slide-in-from-right">
                         <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-gray-800 text-lg">Detalles del día</h3>
                            <button id="closeDetails"><i data-lucide="x" width="20"></i></button>
                        </div>
                        
                        <!-- Metrics -->
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-emerald-50 p-4 rounded-xl text-center">
                                <p class="text-xs text-emerald-600 font-bold uppercase">Ganancia</p>
                                <p class="text-2xl font-black text-emerald-700">${detailMetrics.revenue}€</p>
                            </div>
                            <div class="bg-blue-50 p-4 rounded-xl text-center">
                                <p class="text-xs text-blue-600 font-bold uppercase">Citas</p>
                                <p class="text-xl font-bold text-blue-700">${detailMetrics.count}</p>
                            </div>
                        </div>

                         <!-- Notes -->
                        <textarea id="dailyNote" class="w-full p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm" placeholder="Notas del día...">${savedNote}</textarea>
                        
                        <!-- List -->
                        <div class="space-y-2 flex-1 overflow-y-auto">
                            ${detailMetrics.apts.map(apt => `
                                <div class="p-3 bg-gray-50 rounded-lg flex justify-between text-sm">
                                    <span>${apt.time} ${apt.client}</span>
                                    <span class="font-bold text-gray-500">${apt.price}€</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- New Appointment Modal -->
                <div id="aptModal" class="absolute inset-0 z-50 bg-black/50 ${appointmentModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
                    <div class="bg-white p-6 rounded-2xl w-full max-w-sm">
                        <h3 class="font-bold text-lg mb-4">Nueva Cita</h3>
                        <form id="aptForm">
                            <input name="client" class="w-full p-3 border rounded-xl mb-3" placeholder="Cliente" required />
                            <div class="flex gap-2 mb-3">
                                <input name="time" type="time" class="flex-1 p-3 border rounded-xl" value="10:00" required />
                                <input name="price" type="number" placeholder="€" class="flex-1 p-3 border rounded-xl" required />
                            </div>
                             <div class="flex gap-2">
                                <button type="button" id="closeAptModal" class="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancelar</button>
                                <button type="submit" class="flex-1 py-3 bg-[#059669] text-white rounded-xl font-bold">Guardar</button>
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
            currentDate = new Date(currentDate); // trigger reactivity check if needed, mostly for sanity
            render();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            currentDate = new Date(currentDate);
            render();
        });

        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const dateStr = cell.getAttribute('data-date');
                selectedDate = new Date(dateStr);
                render();
            });
        });

        if (selectedDate) {
            document.getElementById('closeDetails').addEventListener('click', () => {
                selectedDate = null;
                render();
            });

            document.getElementById('dailyNote').addEventListener('blur', (e) => {
                const content = e.target.value;
                const metrics = getMetrics(formatDate(selectedDate));
                store.saveDailyNote(formatDate(selectedDate), content, metrics.revenue);
            });
        }

        document.getElementById('newAptBtn').addEventListener('click', () => {
            if (!selectedDate) selectedDate = new Date(); // Default to today if none selected
            appointmentModalOpen = true;
            render();
        });

        if (appointmentModalOpen) {
            document.getElementById('closeAptModal').addEventListener('click', () => {
                appointmentModalOpen = false;
                render();
            });

            document.getElementById('aptForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                store.addAppointment({
                    client: formData.get('client'),
                    time: formData.get('time'),
                    price: formData.get('price'),
                    date: formatDate(selectedDate),
                    type: 'Corte' // Default
                });
                appointmentModalOpen = false;
                render();
            });
        }
    };

    render();
};
