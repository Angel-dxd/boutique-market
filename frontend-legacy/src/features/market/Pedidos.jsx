import React, { useState } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { Plus, Package, FileText, AlertTriangle, TrendingDown } from 'lucide-react';

const Pedidos = () => {
    const { proveedores, facturas, addFactura, isLoading } = useBoutique();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        referencia: '',
        proveedor_id: '',
        monto: '',
        estado: 'pendiente',
        fecha_vencimiento: ''
    });

    if (isLoading) return <div className="p-10 text-center text-blue-500">Cargando datos de Santi...</div>;

    // Lógica para las "Gráficas" de resumen
    const pendientes = facturas.filter(f => f.estado === 'pendiente');
    const totalDeuda = pendientes.reduce((acc, f) => acc + parseFloat(f.monto || 0), 0);

    // Feature 2: Agenda de Pagos (Ordenada por fecha de vencimiento)
    const agendaPagos = pendientes
        .filter(f => f.fecha_vencimiento)
        .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
        .slice(0, 3); // Top 3 próximos vencimientos

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.monto || !formData.proveedor_id) return;

        await addFactura({
            ...formData,
            monto: parseFloat(formData.monto),
            fecha: new Date().toISOString().split('T')[0]
        });

        setIsModalOpen(false);
        setFormData({ referencia: '', proveedor_id: '', monto: '', estado: 'pendiente', fecha_vencimiento: '' });
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-gray-800 mb-8">Gestión de Pedidos</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* --- BLOQUE DE RESUMEN --- */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Deuda Pendiente</p>
                                <h2 className="text-3xl font-black text-red-500 mt-1">{totalDeuda.toFixed(2)}€</h2>
                            </div>
                            <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><TrendingDown size={24} /></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Proveedores</p>
                                <h2 className="text-3xl font-black text-blue-600 mt-1">{proveedores.length}</h2>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Package size={24} /></div>
                        </div>
                    </div>

                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#1e293b] p-6 rounded-3xl shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="text-center">
                            <Plus className="text-white mx-auto mb-1" size={32} />
                            <p className="text-white font-bold">Añadir Factura</p>
                        </div>
                    </div>
                </div>

                {/* --- FEATURE 2: AGENDA DE PAGOS --- */}
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                    <h3 className="font-black text-orange-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} /> Agenda de Pagos
                    </h3>
                    <div className="space-y-3">
                        {agendaPagos.length > 0 ? agendaPagos.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">
                                        {proveedores.find(pr => pr.id === p.proveedor_id)?.nombre || 'Proveedor'}
                                    </p>
                                    <p className="text-xs text-orange-500 font-medium">Vence: {p.fecha_vencimiento}</p>
                                </div>
                                <span className="font-black text-gray-800">{p.monto}€</span>
                            </div>
                        )) : (
                            <p className="text-sm text-orange-400 italic">¡Todo al día! No hay vencimientos próximos.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TABLA DE FACTURAS (HTML Real) --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                    <FileText className="text-gray-400" size={20} />
                    <h3 className="font-black text-gray-700">Historial de Facturas</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proveedor</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Monto</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Vencimiento</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Referencia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {facturas.length > 0 ? facturas.map(f => (
                                <tr key={f.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 font-bold text-gray-700">
                                        {proveedores.find(p => p.id === f.proveedor_id)?.nombre || 'S/N'}
                                    </td>
                                    <td className="p-4 font-black text-gray-900">{f.monto}€</td>
                                    <td className="p-4 text-sm font-medium text-gray-500">{f.fecha_vencimiento || '---'}</td>
                                    <td className="p-4">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${f.estado === 'pendiente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {f.estado}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 font-mono text-xs">{f.referencia || '---'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-300 font-medium">
                                        No hay facturas registradas para Santi todavía.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Modal: Nueva Factura --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Registrar Factura</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia / Nº Factura</label>
                                <input
                                    type="text"
                                    name="referencia"
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-market focus:border-transparent outline-none"
                                    placeholder="ej. F-2024-001"
                                    value={formData.referencia}
                                    onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                <select
                                    name="proveedor_id"
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-market focus:border-transparent outline-none bg-white"
                                    value={formData.proveedor_id}
                                    onChange={e => setFormData({ ...formData, proveedor_id: e.target.value })}
                                    required
                                >
                                    <option value="">Selecciona un proveedor</option>
                                    {proveedores?.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Importe Total (€)</label>
                                    <input
                                        type="number"
                                        name="monto"
                                        step="0.01"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-market focus:border-transparent outline-none"
                                        placeholder="0.00"
                                        value={formData.monto}
                                        onChange={e => setFormData({ ...formData, monto: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                                    <input
                                        type="date"
                                        name="fecha_vencimiento"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-market focus:border-transparent outline-none"
                                        value={formData.fecha_vencimiento}
                                        onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-market text-white font-medium rounded-xl hover:opacity-90 transition-colors shadow-sm"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pedidos;