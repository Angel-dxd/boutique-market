import React, { useState } from 'react';
import { Search, Plus, X, User, Edit, Trash } from 'lucide-react';
import { useBoutique } from '../../context/BoutiqueContext';

const ClientList = () => {
    const { clients, addClient, updateClient, deleteClient, isSupabaseConnected, isLoading } = useBoutique();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
    const [error, setError] = useState('');

    // ESCUDO 1: Si no hay clientes o está cargando, evitamos que falle
    const safeClients = Array.isArray(clients) ? clients : [];

    // ESCUDO 2: Buscador protegido con Optional Chaining (?.) y fallback de texto vacío
    const filteredClients = safeClients.filter(client => {
        const clientName = (client.nombre || client.name || "").toLowerCase();
        const clientPhone = (client.telefono || client.phone || "");
        return clientName.includes(searchTerm.toLowerCase()) || clientPhone.includes(searchTerm);
    });

    const handleOpenModal = (client = null) => {
        setError('');
        setEditingClient(client);
        if (client) {
            setFormData({
                name: client.nombre || client.name || '',
                phone: client.telefono || client.phone || '',
                email: client.email || '',
                notes: client.notas || client.notes || ''
            });
        } else {
            setFormData({ name: '', phone: '', email: '', notes: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        let result;
        if (editingClient) {
            result = await updateClient(editingClient.id, formData);
        } else {
            result = await addClient(formData);
        }

        if (result.success) {
            setIsModalOpen(false);
        } else {
            setError(result.error || 'Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este cliente de forma permanente?')) {
            await deleteClient(id);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Conectando con Boutique Oh-Nails...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Listado de Clientes
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSupabaseConnected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isSupabaseConnected ? 'CLOUD' : 'LOCAL'}
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500">{filteredClients.length} clientes encontrados</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a373]/50 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-[#d4a373] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Plus size={16} /> Nuevo
                    </button>
                </div>
            </div>

            {/* List/Table */}
            <div className="flex-1 overflow-y-auto">
                {filteredClients.length > 0 ? (
                    <div className="md:w-full">
                        <div className="hidden md:grid grid-cols-12 bg-gray-50/50 text-gray-500 text-xs uppercase p-4 font-semibold border-b border-gray-100">
                            <div className="col-span-4">Cliente</div>
                            <div className="col-span-3">Contacto</div>
                            <div className="col-span-3">Notas</div>
                            <div className="col-span-2 text-right">Acciones</div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {filteredClients.map((client) => (
                                <div key={client.id} className="p-4 md:grid md:grid-cols-12 md:items-center hover:bg-gray-50/50 transition-colors group">
                                    <div className="col-span-4 flex items-center gap-3 mb-2 md:mb-0">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 text-[#d4a373] flex items-center justify-center font-bold text-sm shrink-0">
                                            {(client.nombre || client.name || "U")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{client.nombre || client.name}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-3 text-sm text-gray-600 mb-2 md:mb-0">
                                        <p>{client.telefono || client.phone || '-'}</p>
                                        <p className="text-xs text-gray-400">{client.email || ''}</p>
                                    </div>

                                    <div className="col-span-3 text-sm text-gray-500 italic truncate mb-2 md:mb-0">
                                        {client.notas || client.notes || 'Sin notas'}
                                    </div>

                                    <div className="col-span-2 flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <User size={48} className="opacity-20 mb-2" />
                        <p>No se encontraron clientes</p>
                    </div>
                )}
            </div>

            {/* Modal de Nuevo/Editar... (El resto del modal se mantiene igual) */}
            {/* ... */}
        </div>
    );
};

export default ClientList;