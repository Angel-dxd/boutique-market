import React, { useState } from 'react';
import { Camera, Tag, Edit3, Share2, Plus, X, Image as ImageIcon } from 'lucide-react';

const NailsGallery = () => {
    // Mock Data
    const [works, setWorks] = useState([
        { id: 1, title: 'Diseño Navideño 2025', category: 'Nail Art', tags: ['Navidad', 'Rojo', 'Glitter'], image: 'https://placehold.co/400x400/059669/ffffff?text=Navidad' },
        { id: 2, title: 'Francesa Clásica', category: 'Semipermanente', tags: ['Clásico', 'Elegante'], image: 'https://placehold.co/400x400/e5e7eb/059669?text=Francesa' },
        { id: 3, title: 'Stiletto Neon', category: 'Acrílicas', tags: ['Verano', 'Neon', 'Largo'], image: 'https://placehold.co/400x400/059669/ffffff?text=Neon' },
        { id: 4, title: 'Baby Boomer', category: 'Acrílicas', tags: ['Degradado', 'Nude'], image: 'https://placehold.co/400x400/e5e7eb/059669?text=BabyBoomer' },
        { id: 5, title: 'Efecto Mármol', category: 'Diseño', tags: ['Mármol', 'Negro', 'Blanco'], image: 'https://placehold.co/400x400/059669/ffffff?text=Marmol' },
    ]);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedWork, setSelectedWork] = useState(null);

    // Form Stats
    const [newWork, setNewWork] = useState({ title: '', category: 'Acrílicas', tags: '' });

    const handleUpload = (e) => {
        e.preventDefault();
        const tagsArray = newWork.tags.split(',').map(tag => tag.trim());
        const workToAdd = {
            id: works.length + 1,
            title: newWork.title || 'Nuevo Trabajo',
            category: newWork.category,
            tags: tagsArray.length > 0 && tagsArray[0] !== '' ? tagsArray : ['Nuevo'],
            image: 'https://placehold.co/400x400/059669/ffffff?text=Nuevo'
        };
        setWorks([workToAdd, ...works]);
        setIsUploadModalOpen(false);
        setNewWork({ title: '', category: 'Acrílicas', tags: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mis Uñas</h2>
                    <p className="text-gray-500">Portafolio de diseños y trabajos realizados</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-boutique hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus size={20} />
                    Subir Nuevo Trabajo
                </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {works.map((work) => (
                    <div key={work.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                        <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer" onClick={() => setSelectedWork(work)}>
                            <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">Ver Detalles</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800 truncate pr-2">{work.title}</h3>
                                <button onClick={() => setSelectedWork(work)} className="text-gray-400 hover:text-boutique transition-colors">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                            <span className="text-xs font-semibold text-boutique bg-emerald-50 px-2 py-1 rounded-md mb-3 inline-block">
                                {work.category}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {work.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Tag size={10} /> {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Nuevo Trabajo</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-boutique hover:text-boutique transition-colors cursor-pointer bg-gray-50/50">
                                <Camera size={48} className="mb-2" />
                                <p className="text-sm">Click para subir foto</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título / Cliente</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-boutique/50"
                                    placeholder="Ej: Manicura Soft Gel"
                                    value={newWork.title}
                                    onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-boutique/50 bg-white"
                                    value={newWork.category}
                                    onChange={(e) => setNewWork({ ...newWork, category: e.target.value })}
                                >
                                    <option>Acrílicas</option>
                                    <option>Semipermanente</option>
                                    <option>Nail Art</option>
                                    <option>Pedicura</option>
                                    <option>Diseño</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-boutique/50"
                                    placeholder="Rojo, Verano, Cortas..."
                                    value={newWork.tags}
                                    onChange={(e) => setNewWork({ ...newWork, tags: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-boutique text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all hover:opacity-90 mt-4">
                                Guardar en Galería
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit / Preview Modal */}
            {selectedWork && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-4">
                            <img src={selectedWork.image} alt={selectedWork.title} className="w-full h-auto rounded-lg shadow-md" />
                        </div>
                        <div className="md:w-1/2 p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{selectedWork.title}</h3>
                                    <p className="text-boutique font-medium">{selectedWork.category}</p>
                                </div>
                                <button onClick={() => setSelectedWork(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Etiquetas</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedWork.tags.map((tag, i) => (
                                            <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">#{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-600 italic">"¡Mira qué brillo! ✨ Trabajo realizado hoy en Oh-Nails. #nails #art"</p>
                                    <div className="mt-2 text-xs text-gray-400 flex justify-end">Vista previa de pie de foto</div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                                <button className="flex-1 bg-boutique text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex justify-center items-center gap-2">
                                    <Share2 size={18} /> Publicar
                                </button>
                                <button className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all">
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NailsGallery;
