import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, FileText, AlertTriangle } from 'lucide-react';
import { useBoutique } from '../../context/BoutiqueContext';

const AppointmentCalendar = () => {
    // Defensive destructuring: default empty arrays if context fails
    const context = useBoutique();
    const {
        appointments = [],
        addAppointment = () => { },
        dailyNotes = {},
        saveDailyNote = () => { },
        connectionError
    } = context || {};

    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
    const [selectedDate, setSelectedDate] = useState(null);
    const [noteContent, setNoteContent] = useState('');
    const [isAptModalOpen, setIsAptModalOpen] = useState(false);
    const [newApt, setNewApt] = useState({ client: '', type: 'Corte', time: '10:00', price: '' });

    // Safely handle dates
    const getFormattedDate = (day) => {
        try {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const offset = d.getTimezoneOffset();
            const local = new Date(d.getTime() - (offset * 60 * 1000));
            return local.toISOString().split('T')[0];
        } catch (e) { return ''; }
    };

    const daysInMonth = useMemo(() => {
        try {
            return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        } catch (e) { return 30; }
    }, [currentDate]);

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    // Logic
    const getAppointmentsForDate = (dateStr) => Array.isArray(appointments) ? appointments.filter(a => a.date === dateStr) : [];

    // ... Metrics calculation logic same as before ...
    const calculateMetrics = (dateStr) => {
        const apts = getAppointmentsForDate(dateStr);
        const revenue = apts.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
        const hours = apts.length * 0.5;
        return { revenue, hours, count: apts.length };
    };

    // Handlers
    const handleDayClick = (day) => {
        const dateStr = getFormattedDate(day);
        setSelectedDate(dateStr);
        setNoteContent(dailyNotes[dateStr]?.content || '');
    };

    const handleSaveNote = () => {
        if (selectedDate) {
            const metrics = calculateMetrics(selectedDate);
            saveDailyNote(selectedDate, noteContent, metrics.revenue);
        }
    };

    const handleSaveApt = async () => {
        if (!newApt.client) return;
        const targetDate = selectedDate || getFormattedDate(new Date().getDate());
        await addAppointment({
            ...newApt,
            date: targetDate,
            price: parseFloat(newApt.price) || 0,
            status: 'confirmed'
        });
        setIsAptModalOpen(false);
        setNewApt({ client: '', type: 'Corte', time: '10:00', price: '' });
    };

    const detailMetrics = selectedDate ? calculateMetrics(selectedDate) : { revenue: 0, hours: 0, count: 0 };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] flex flex-col relative overflow-hidden">
            {/* Error Banner */}
            {connectionError && (
                <div className="bg-red-50 p-2 text-red-600 text-xs flex items-center justify-center gap-2 font-bold">
                    <AlertTriangle size={14} />
                    SIN CONEXIÓN: Los datos no se guardan. ({connectionError})
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 capitalize">{monthName}</h2>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button className="p-1 hover:bg-white rounded shadow-sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft size={20} /></button>
                        <button className="p-1 hover:bg-white rounded shadow-sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight size={20} /></button>
                    </div>
                </div>
                <button
                    onClick={() => { setSelectedDate(getFormattedDate(new Date().getDate())); setIsAptModalOpen(true); }}
                    className="px-4 py-2 bg-boutique text-white rounded-lg hover:opacity-90 flex items-center gap-2 text-sm font-bold"
                >
                    <CalendarIcon size={16} /> Nueva
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d} className="py-2 text-center text-xs font-bold text-gray-500">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr">
                    {daysArray.map(day => {
                        const dateStr = getFormattedDate(day);
                        const metrics = calculateMetrics(dateStr);
                        const hasNote = dailyNotes[dateStr]?.content;

                        return (
                            <div
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`border-b border-r border-gray-100 min-h-[80px] p-2 relative cursor-pointer ${selectedDate === dateStr ? 'bg-orange-50' : 'bg-white'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-gray-700">{day}</span>
                                    {metrics.revenue > 0 && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1 rounded font-bold">{metrics.revenue}€</span>}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {Array.from({ length: Math.min(metrics.count, 5) }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300" />)}
                                </div>
                                {hasNote && <FileText size={10} className="absolute bottom-1 right-1 text-orange-400" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Details reused logic... simplified for brevity but essential parts included above */}
            {selectedDate && (
                <div className="absolute top-0 right-0 h-full w-full md:w-80 bg-white shadow-xl z-20 flex flex-col p-6 border-l border-gray-100 animate-in slide-in-from-right">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 text-lg">Detalles del día</h3>
                        <button onClick={() => setSelectedDate(null)}><X size={20} /></button>
                    </div>
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-50 p-4 rounded-xl text-center">
                            <p className="text-xs text-emerald-600 font-bold uppercase">Ganancia</p>
                            <p className="text-2xl font-black text-emerald-700">{detailMetrics.revenue}€</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                            <p className="text-xs text-blue-600 font-bold uppercase">Tiempo</p>
                            <p className="text-xl font-bold text-blue-700">{detailMetrics.hours}h</p>
                        </div>
                    </div>
                    {/* Notes */}
                    <textarea
                        className="w-full p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        placeholder="Notas del día..."
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        onBlur={handleSaveNote}
                    />
                    {/* Apts List */}
                    <div className="space-y-2">
                        {getAppointmentsForDate(selectedDate).map((apt, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg flex justify-between text-sm">
                                <span>{apt.time} {apt.client}</span>
                                <span className="font-bold text-gray-500">{apt.price}€</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Add Appointment reused... */}
            {isAptModalOpen && (
                <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-4">Nueva Cita</h3>
                        <input className="w-full p-3 border rounded-xl mb-3" placeholder="Cliente" value={newApt.client} onChange={e => setNewApt({ ...newApt, client: e.target.value })} />
                        <div className="flex gap-2 mb-3">
                            <input type="time" className="flex-1 p-3 border rounded-xl" value={newApt.time} onChange={e => setNewApt({ ...newApt, time: e.target.value })} />
                            <input type="number" placeholder="€" className="flex-1 p-3 border rounded-xl" value={newApt.price} onChange={e => setNewApt({ ...newApt, price: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsAptModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancelar</button>
                            <button onClick={handleSaveApt} className="flex-1 py-3 bg-boutique text-white rounded-xl font-bold">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentCalendar;
