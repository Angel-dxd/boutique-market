
import React, { useState } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { UserPlus, Phone, Building2, Tag, Edit, Trash, X, Upload } from 'lucide-react';

const Proveedores = () => {
    const { proveedores, isLoading, addProveedor, updateProveedor, deleteProveedor, importProveedoresFromCSV } = useBoutique();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        empresa: '',
        categoria: ''
    });

    const categories = ['Suministros', 'Producto', 'Servicios', 'Logística', 'Otro'];

    if (isLoading) return <div className="p-10 text-center font-bold text-blue-500">Cargando Directorio...</div>;

    const handleEdit = (p) => {
        setFormData({
            nombre: p.nombre,
            telefono: p.telefono,
            empresa: p.empresa,
            categoria: p.categoria
        });
        setEditingId(p.id);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setFormData({ nombre: '', telefono: '', empresa: '', categoria: 'Suministros' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar proveedor?')) {
            await deleteProveedor(id);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (window.confirm(`¿Importar proveedores desde ${file.name}?`)) {
            const { success, count, error } = await importProveedoresFromCSV(file);
            if (success) {
                alert(`¡Éxito! Se han importado ${count} proveedores.`);
            } else {
                alert(`Error: ${error}`);
            }
        }
        e.target.value = ''; // Reset input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingId) {
            await updateProveedor(editingId, formData);
        } else {
            await addProveedor(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">Proveedores</h1>
                    <p className="text-gray-500 font-medium">Contactos comerciales de El Gallo Azul</p>
                </div>
                <label className="bg-white border border-gray-200 text-gray-600 px-6 py-4 rounded-3xl font-bold flex items-center gap-3 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
                    <Upload size={20} />
                    <span className="hidden md:inline">IMPORTAR CSV</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                </label>
                <button
                    onClick={handleNew}
                    className="bg-[#1e293b] text-white px-8 py-4 rounded-3xl font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-xl"
                >
                    <UserPlus size={22} /> NUEVO CONTACTO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {proveedores.length > 0 ? proveedores.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
                        {/* Actions Overlay */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(p)} className="p-2 bg-gray-100 rounded-xl hover:bg-blue-100 text-gray-400 hover:text-blue-500">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 bg-gray-100 rounded-xl hover:bg-red-100 text-gray-400 hover:text-red-500">
                                <Trash size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-5 mb-6">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Building2 size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-800 text-xl leading-tight">{p.nombre}</h3>
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-widest mt-1 inline-block">
                                    {p.categoria || 'Suministros'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-4 text-gray-600 font-bold">
                                <div className="p-2 bg-gray-50 rounded-xl"><Phone size={18} /></div>
                                {p.telefono || 'Sin contacto'}
                            </div>
                            <div className="flex items-center gap-4 text-gray-600 font-bold">
                                <div className="p-2 bg-gray-50 rounded-xl"><Tag size={18} /></div>
                                {p.empresa || 'Empresa Local'}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 text-center bg-white rounded-[50px] border-4 border-dashed border-gray-50">
                        <p className="text-gray-300 text-xl font-black italic">No hay proveedores registrados aún.</p>
                    </div>
                )}
            </div>

            {/* CRUD Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-800">
                                {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre del Contacto</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Juan Pérez"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Teléfono</label>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                        placeholder="+34 600..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Categoría</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                        value={formData.categoria}
                                        onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Empresa</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                    value={formData.empresa}
                                    onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                                    placeholder="Ej. Distribuciones S.L."
                                />
                            </div>

                            <button type="submit" className="w-full py-4 bg-[#1e293b] text-white rounded-2xl font-black text-lg hover:opacity-90 transition-opacity shadow-lg">
                                {editingId ? 'Guardar Cambios' : 'Añadir Proveedor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proveedores;