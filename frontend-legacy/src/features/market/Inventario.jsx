import React, { useState } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { Package, Search, Plus, Trash, Edit, RefreshCw } from 'lucide-react';

const Inventario = () => {
    const { products, proveedores, isLoading, updateProduct, deleteProduct, addProduct, addTransaction } = useBoutique();
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);

    // Mermas State
    const [isMermaModalOpen, setIsMermaModalOpen] = useState(false);
    const [mermaData, setMermaData] = useState({ productId: '', quantity: 1, reason: 'Caducidad' });

    // Add Product State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProductData, setNewProductData] = useState({
        nombre: '',
        categoria: 'General',
        precio: '',
        coste: '',
        stock: 0,
        min_stock: 5,
        proveedor_id: ''
    });

    const categories = ['Carnicería', 'Charcutería', 'Elaborados', 'Quesos', 'Conservas', 'General'];

    // --- Derived State ---
    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.title || p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
        const isLowStock = (p.stock || 0) <= (p.min_stock || 5);

        if (showLowStock) return matchesSearch && isLowStock;
        return matchesSearch;
    });

    // --- Handlers ---
    const handleStockUpdate = async (id, currentStock, change) => {
        const newStock = Math.max(0, (currentStock || 0) + change);
        await updateProduct(id, { stock: newStock });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            await deleteProduct(id);
        }
    };

    const handleAddProductSubmit = async (e) => {
        e.preventDefault();
        await addProduct({
            title: newProductData.nombre,
            price: parseFloat(newProductData.precio || 0),
            cost: parseFloat(newProductData.coste || 0),
            stock: parseInt(newProductData.stock || 0),
            min_stock: parseInt(newProductData.min_stock || 5),
            categoria: newProductData.categoria,
            proveedor_id: newProductData.proveedor_id ? parseInt(newProductData.proveedor_id) : null
        });
        setIsAddModalOpen(false);
        setNewProductData({ nombre: '', categoria: 'General', precio: '', coste: '', stock: 0, min_stock: 5, proveedor_id: '' });
    };

    // Feature 4: Logica de Mermas
    const handleMermaSubmit = async (e) => {
        e.preventDefault();
        const product = products.find(p => p.id === parseInt(mermaData.productId));
        if (!product) return;

        // 1. Reducir Stock
        const newStock = Math.max(0, (product.stock || 0) - parseInt(mermaData.quantity));
        await updateProduct(product.id, { stock: newStock });

        // 2. Registrar Gasto Financiero (Pérdida)
        const estimatedCost = (product.cost || product.price * 0.6 || 0);
        const totalLoss = estimatedCost * parseInt(mermaData.quantity);

        await addTransaction({
            tipo: 'salida',
            categoria: 'Merma / Desperdicio',
            monto: totalLoss,
            nota: `Merma: ${mermaData.quantity}x ${product.title || product.nombre} - ${mermaData.reason}`
        });

        setIsMermaModalOpen(false);
        setMermaData({ productId: '', quantity: 1, reason: 'Caducidad' });
        alert('Merma registrada y descontada del stock.');
    };

    if (isLoading) return <div className="p-10 text-center text-blue-500">Cargando Inventario...</div>;

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Inventario</h1>
                    <p className="text-gray-500 font-medium">Control de existencias</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsMermaModalOpen(true)}
                        className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-red-100 transition-colors"
                    >
                        <Trash size={20} /> Merma
                    </button>
                    <button
                        onClick={() => setShowLowStock(!showLowStock)}
                        className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${showLowStock ? 'bg-red-100 text-red-600' : 'bg-white border border-gray-200 text-gray-600'}`}
                    >
                        <RefreshCw size={20} className={showLowStock ? 'animate-spin-slow' : ''} />
                        {showLowStock ? 'Ver Todo' : 'Bajo Stock'}
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus size={20} /> Nuevo
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Producto</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.length > 0 ? filteredProducts.map(p => {
                            const stock = p.stock || 0;
                            const min = p.min_stock || 5;
                            const isLow = stock <= min;

                            return (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-5">
                                        <div className="font-bold text-gray-800">{p.title || p.nombre}</div>
                                        <div className="text-xs text-gray-400">{p.categoria || 'General'}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleStockUpdate(p.id, stock, -1)}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="font-black w-8 text-center text-lg">{stock}</span>
                                            <button
                                                onClick={() => handleStockUpdate(p.id, stock, 1)}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 flex items-center justify-center transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {isLow ? 'REPONER' : 'OK'}
                                        </span>
                                    </td>
                                    <td className="p-5 font-bold text-gray-600">{p.price || p.precio || 0}€</td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Edit not implemented fully yet, just toggle placeholder or rely on quick stock edit */}
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-400 font-medium italic">
                                    No se encontraron productos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Mermas */}
            {isMermaModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                            <Trash size={24} /> Registrar Merma
                        </h3>
                        <form onSubmit={handleMermaSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Producto a descartar</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-100 outline-none bg-white font-bold"
                                    value={mermaData.productId}
                                    onChange={e => setMermaData({ ...mermaData, productId: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar Producto</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.title || p.nombre} (Stock: {p.stock})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                    <input
                                        type="number" min="1"
                                        className="w-full px-4 py-2 border rounded-xl outline-none"
                                        value={mermaData.quantity}
                                        onChange={e => setMermaData({ ...mermaData, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-xl outline-none bg-white"
                                        value={mermaData.reason}
                                        onChange={e => setMermaData({ ...mermaData, reason: e.target.value })}
                                    >
                                        <option value="Caducidad">Caducidad</option>
                                        <option value="Dañado">Dañado</option>
                                        <option value="Error Preparación">Error Preparación</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg">
                                * Se descontará del stock y se registrará como pérdida financiera.
                            </p>
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsMermaModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-xl font-bold text-gray-500">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Nuevo Producto */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-black text-gray-800 mb-8">Nuevo Producto</h2>

                        <form onSubmit={handleAddProductSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                    value={newProductData.nombre}
                                    onChange={e => setNewProductData({ ...newProductData, nombre: e.target.value })}
                                    placeholder="Ej. Pollo Asado Entero"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Categoría</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                        value={newProductData.categoria}
                                        onChange={e => setNewProductData({ ...newProductData, categoria: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Proveedor</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                        value={newProductData.proveedor_id}
                                        onChange={e => setNewProductData({ ...newProductData, proveedor_id: e.target.value })}
                                    >
                                        <option value="">General (Sin Prov)</option>
                                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Precio Venta (€)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                        value={newProductData.precio}
                                        onChange={e => setNewProductData({ ...newProductData, precio: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Coste (€)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-800"
                                        value={newProductData.coste}
                                        onChange={e => setNewProductData({ ...newProductData, coste: e.target.value })}
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div>
                                    <label className="block text-xs font-bold text-blue-500 mb-2 uppercase">Stock Inicial</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-white border border-blue-100 rounded-xl outline-none font-bold text-gray-800"
                                        value={newProductData.stock}
                                        onChange={e => setNewProductData({ ...newProductData, stock: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-500 mb-2 uppercase">Alerta Mínimo</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-white border border-blue-100 rounded-xl outline-none font-bold text-gray-800"
                                        value={newProductData.min_stock}
                                        onChange={e => setNewProductData({ ...newProductData, min_stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-black text-lg hover:opacity-90 shadow-lg"
                                >
                                    Crear Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;
