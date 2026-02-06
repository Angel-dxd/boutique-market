const renderProviders = async () => {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="text-center p-10">Cargando Proveedores...</div>';

    const providers = await api.get('/providers');

    if (providers.error) {
        content.innerHTML = `<div class="text-red-500 p-10">Error: ${providers.error}</div>`;
        return;
    }

    const cards = providers.map(p => `
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative">
             <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="deleteProvider('${p.id}')" class="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100">
                    <i data-lucide="trash-2" width="16"></i>
                </button>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <i data-lucide="building-2"></i>
                </div>
                <div>
                    <h3 class="font-black text-slate-800 text-lg">${p.nombre}</h3>
                    <span class="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">${p.categoria || 'SUMINISTROS'}</span>
                </div>
            </div>
            <div class="space-y-2 text-sm font-bold text-slate-500">
                <div class="flex items-center gap-3">
                    <i data-lucide="phone" width="16"></i> ${p.telefono || 'Sin contacto'}
                </div>
                <div class="flex items-center gap-3">
                    <i data-lucide="briefcase" width="16"></i> ${p.empresa || 'Particular'}
                </div>
            </div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-black text-slate-800">Proveedores</h1>
                <p class="text-slate-400 font-medium">Gestión de contactos</p>
            </div>
            <div class="flex gap-2">
                 <label class="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors">
                    <i data-lucide="upload"></i>
                    <span class="hidden md:inline">Importar CSV</span>
                    <input type="file" onchange="handleImport(event)" accept=".csv" class="hidden">
                 </label>
                <button onclick="openProviderModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
                    <i data-lucide="plus"></i> Nuevo
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${cards}
        </div>
    `;
    lucide.createIcons();
};

const deleteProvider = async (id) => {
    if (confirm('¿Seguro que quieres eliminar este proveedor?')) {
        await api.delete(`/providers/${id}`);
        renderProviders();
    }
};

const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (confirm(`¿Importar archivo ${file.name}?`)) {
        // Simple client-side CSV parsing to match existing logic
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const rows = text.split('\n').map(row => row.split(','));

            // Minimal Parsing logic (copied simplified concept)
            const headers = rows[0].map(h => h.trim().toLowerCase().replace(/"/g, ''));
            // Indices match logic from React version
            const nameIdx = headers.findIndex(h => h.includes('nombre'));

            const providers = rows.slice(1).filter(r => r.length > 1).map(r => {
                return {
                    nombre: r[nameIdx]?.replace(/"/g, '').trim() || 'Importado',
                    telefono: r[1]?.replace(/"/g, '').trim(), // Fallback indices
                    empresa: r[2]?.replace(/"/g, '').trim(),
                    categoria: 'Importado'
                };
            });

            const res = await api.post('/providers/bulk', { providers });
            if (res.count) alert(`Importados ${res.count} proveedores`);
            renderProviders();
        };
        reader.readAsText(file);
    }
    e.target.value = '';
};
