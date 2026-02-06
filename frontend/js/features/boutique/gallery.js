
export const renderGallery = (container) => {
    // Local state for this component (Mock state as image upload to local storage is heavy)
    // In a real app, this would be in store or separate api
    let works = [
        { id: 1, title: 'Diseño Navideño 2025', category: 'Nail Art', tags: ['Navidad', 'Rojo'], image: 'https://placehold.co/400x400/059669/ffffff?text=Navidad' },
        { id: 2, title: 'Francesa Clásica', category: 'Semipermanente', tags: ['Clásico'], image: 'https://placehold.co/400x400/e5e7eb/059669?text=Francesa' },
    ];

    let isUploadOpen = false;

    const render = () => {
        container.innerHTML = `
            <div class="space-y-6">
                 <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">Mis Uñas</h2>
                        <p class="text-gray-500">Portafolio de diseños y trabajos realizados</p>
                    </div>
                    <button id="uploadBtn" class="bg-[#059669] hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                        <i data-lucide="plus" width="20"></i> Subir Nuevo Trabajo
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${works.map(work => `
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                             <div class="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                                <img src="${work.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold text-gray-800 truncate">${work.title}</h3>
                                <span class="text-xs font-semibold text-[#059669] bg-emerald-50 px-2 py-1 rounded-md mb-3 inline-block">
                                    ${work.category}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Upload Modal -->
                <div id="uploadModal" class="fixed inset-0 bg-black/50 z-50 ${isUploadOpen ? 'flex' : 'hidden'} items-center justify-center p-4 backdrop-blur-sm">
                    <div class="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
                         <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-gray-800">Nuevo Trabajo</h3>
                            <button id="closeUpload"><i data-lucide="x" width="24"></i></button>
                        </div>
                        <form id="uploadForm" class="space-y-4">
                             <div class="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                <i data-lucide="camera" width="48" class="mb-2"></i>
                                <p class="text-sm">Fake Upload</p>
                            </div>
                            <input name="title" required class="w-full px-4 py-2 border rounded-xl" placeholder="Título" />
                            <select name="category" class="w-full px-4 py-2 border rounded-xl bg-white">
                                <option>Acrílicas</option>
                                <option>Semipermanente</option>
                            </select>
                            <button type="submit" class="w-full bg-[#059669] text-white py-3 rounded-xl font-bold">Guardar</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        document.getElementById('uploadBtn').addEventListener('click', () => {
            isUploadOpen = true;
            render();
        });

        if (isUploadOpen) {
            document.getElementById('closeUpload').addEventListener('click', () => {
                isUploadOpen = false;
                render();
            });
            document.getElementById('uploadForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                works.unshift({
                    id: Date.now(),
                    title: formData.get('title'),
                    category: formData.get('category'),
                    image: 'https://placehold.co/400x400/059669/ffffff?text=New',
                    tags: []
                });
                isUploadOpen = false;
                render();
            });
        }
    };
    render();
};
