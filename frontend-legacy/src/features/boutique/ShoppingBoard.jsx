import React, { useState } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { Plus, MoreVertical, Tag, X, Trash } from 'lucide-react';

const ShoppingBoard = () => {
    const {
        products, productLabels,
        addProduct, deleteProduct, updateProductLabel,
        addLabel, deleteLabel
    } = useBoutique();

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

    // Filter products by label
    const getProductsByLabel = (labelId) => products.filter(p => p.label_id === labelId);

    // Simple drag simulation (click to move for MVP robustness)
    const handleMoveProduct = (productId) => {
        // Find current label index and move to next, or cycle
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const currentLabelIndex = productLabels.findIndex(l => l.id === product.label_id);
        const nextLabelIndex = (currentLabelIndex + 1) % productLabels.length;
        const nextLabel = productLabels[nextLabelIndex];

        if (nextLabel) updateProductLabel(productId, nextLabel.id);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
                    <p className="text-gray-500">Gestión de productos y estado</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsLabelModalOpen(true)}
                        className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                    >
                        <Tag size={18} /> Etiquetas
                    </button>
                    <button
                        onClick={() => setIsProductModalOpen(true)}
                        className="bg-[#d4a373] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus size={20} /> Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Board Columns */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full min-w-max">
                    {productLabels.map(label => (
                        <div key={label.id} className="w-80 flex flex-col h-full">
                            {/* Column Header */}
                            <div className={`p-4 rounded-t-xl font-bold flex justify-between items-center bg-white border-b-4 ${label.color.split(' ')[2] || 'border-gray-200'}`}>
                                <span className="text-gray-700">{label.name}</span>
                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{getProductsByLabel(label.id).length}</span>
                            </div>

                            {/* Column Body */}
                            <div className="bg-gray-50 p-3 rounded-b-xl flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                                {getProductsByLabel(label.id).map(product => (
                                    <div
                                        key={product.id}
                                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all group relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            {/* Label Dot */}
                                            <div className={`w-2 h-2 rounded-full ${label.color.split(' ')[0] || 'bg-gray-400'}`}></div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => deleteProduct(product.id)} className="text-gray-300 hover:text-red-500"><Trash size={14} /></button>
                                                <button onClick={() => handleMoveProduct(product.id)} className="text-gray-300 hover:text-blue-500 text-xs font-bold border rounded px-1">Next</button>
                                            </div>
                                        </div>
                                        <h4 className="font-medium text-gray-800">{product.title}</h4>
                                        <p className="text-xs text-gray-400 mt-2">ID: #{product.id}</p>
                                    </div>
                                ))}
                                {getProductsByLabel(label.id).length === 0 && (
                                    <div className="text-center text-gray-300 text-sm py-8 italic">Vacío</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {productLabels.length === 0 && (
                        <div className="p-8 text-gray-400">No hay etiquetas. Crea una para empezar.</div>
                    )}
                </div>
            </div>

            {/* Modals handled here simpler for MVP */}
            {isProductModalOpen && <ProductModal onClose={() => setIsProductModalOpen(false)} onAdd={addProduct} labels={productLabels} />}
            {isLabelModalOpen && <LabelsModal onClose={() => setIsLabelModalOpen(false)} labels={productLabels} onAdd={addLabel} onDelete={deleteLabel} />}
        </div>
    );
};

const ProductModal = ({ onClose, onAdd, labels }) => {
    const [title, setTitle] = useState('');
    const [labelId, setLabelId] = useState(labels[0]?.id || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title && labelId) {
            onAdd(title, parseInt(labelId));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Añadir Producto</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nombre del producto" className="w-full px-4 py-2 border rounded-lg" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                    <select className="w-full px-4 py-2 border rounded-lg" value={labelId} onChange={e => setLabelId(e.target.value)}>
                        {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-[#d4a373] text-white rounded-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LabelsModal = ({ onClose, labels, onAdd, onDelete }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('bg-gray-100 text-gray-800 border-gray-200');

    // Preset Tailwind Colors (Background, Text, Border)
    const colorPresets = [
        { name: 'Gris', val: 'bg-gray-100 text-gray-800 border-gray-200' },
        { name: 'Rojo', val: 'bg-red-100 text-red-800 border-red-200' },
        { name: 'Amarillo', val: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        { name: 'Verde', val: 'bg-green-100 text-green-800 border-green-200' },
        { name: 'Azul', val: 'bg-blue-100 text-blue-800 border-blue-200' },
        { name: 'Morado', val: 'bg-purple-100 text-purple-800 border-purple-200' },
    ];

    const handleAdd = (e) => {
        e.preventDefault();
        if (name) {
            onAdd(name, color);
            setName('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Gestionar Etiquetas</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>

                {/* List */}
                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                    {labels.map(l => (
                        <div key={l.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full ${l.color.split(' ')[0]}`}></span>
                                <span className="font-medium text-gray-700">{l.name}</span>
                            </div>
                            <button onClick={() => onDelete(l.id)} className="text-red-400 hover:text-red-600"><Trash size={16} /></button>
                        </div>
                    ))}
                </div>

                {/* Add New */}
                <form onSubmit={handleAdd} className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Nueva Etiqueta</p>
                    <div className="flex gap-2 mb-2">
                        <input type="text" placeholder="Nombre (ej: Urgente)" className="flex-1 px-3 py-2 border rounded-lg text-sm" value={name} onChange={e => setName(e.target.value)} />
                        <button type="submit" className="bg-gray-800 text-white px-4 rounded-lg text-sm">Añadir</button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto py-1">
                        {colorPresets.map((c, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setColor(c.val)}
                                className={`w-6 h-6 rounded-full border-2 ${c.val.split(' ')[0]} ${color === c.val ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                                title={c.name}
                            />
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShoppingBoard;
