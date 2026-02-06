const renderInventory = async () => {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="text-center p-10">Cargando Inventario...</div>';

    const products = await api.get('/products');

    if (products.error) {
        content.innerHTML = `<div class="text-red-500 p-10">Error cargando inventario: ${products.error}</div>`;
        return;
    }

    const rows = products.map(p => {
        const statusColor = p.stock <= p.min_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
        const statusText = p.stock <= p.min_stock ? 'BAJO STOCK' : 'OK';

        return `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="p-4 font-bold text-slate-700">${p.title}</td>
                <td class="p-4 text-slate-500">${p.categoria || 'G'}</td>
                <td class="p-4 text-right font-mono font-bold text-indigo-600">${parseFloat(p.price).toFixed(2)}€</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="updateStock('${p.id}', ${p.stock - 1})" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">-</button>
                        <span class="w-8 text-center font-bold">${p.stock}</span>
                        <button onclick="updateStock('${p.id}', ${p.stock + 1})" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">+</button>
                    </div>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-full text-xs font-black ${statusColor}">${statusText}</span>
                </td>
            </tr>
        `;
    }).join('');

    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-black text-slate-800">Inventario</h1>
            <button onclick="openProductModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
                <i data-lucide="plus"></i> Nuevo Producto
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table class="w-full">
                <thead class="bg-slate-50 text-slate-500 font-bold text-sm uppercase tracking-wider">
                    <tr>
                        <th class="p-4 text-left">Producto</th>
                        <th class="p-4 text-left">Categoría</th>
                        <th class="p-4 text-right">Precio</th>
                        <th class="p-4 text-center">Stock</th>
                        <th class="p-4 text-left">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
};

const updateStock = async (id, newStock) => {
    if (newStock < 0) return;
    await api.put(`/products/${id}/stock`, { stock: newStock });
    renderInventory(); // Refresh
};

// Modal Logic (Simplified)
const openProductModal = () => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <h2 class="text-2xl font-black mb-6">Nuevo Producto</h2>
            <form onsubmit="handleCreateProduct(event)" class="space-y-4">
                <input name="title" placeholder="Nombre del Producto" required class="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold">
                <div class="grid grid-cols-2 gap-4">
                    <input name="price" type="number" step="0.01" placeholder="Precio Venta" required class="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold">
                    <input name="cost" type="number" step="0.01" placeholder="Costo" class="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <input name="stock" type="number" placeholder="Stock Inicial" class="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold">
                    <input name="min_stock" type="number" placeholder="Alerta Min." class="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold">
                </div>
                 <input name="categoria" placeholder="Categoría" class="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold">
                
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 py-3 bg-slate-100 font-bold text-slate-500 rounded-xl">Cancelar</button>
                    <button type="submit" class="flex-1 py-3 bg-indigo-600 font-bold text-white rounded-xl shadow-lg shadow-indigo-200">Guardar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
};

const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const res = await api.post('/products', data);
    if (!res.error) {
        document.querySelector('.fixed').remove(); // Close modal
        renderInventory();
    } else {
        alert(res.error);
    }
};
