import { api } from '../core/api.js';

export const renderGallery = async (container) => {
    let works = [];
    let isUploadOpen = false;

    // Fetch data directly from MySQL
    const fetchAndRender = async () => {
        const response = await api.get('/gallery');
        works = response.error ? [] : response;
        render();
    };

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
                    <input type="file" id="fileInput" accept="image/*" class="hidden" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${works.length === 0 ? `<div class="col-span-full text-center text-gray-500 py-10 border-2 border-dashed rounded-xl">No hay trabajos en el portafolio. ¡Sube el primero!</div>` : ''}
                    ${works.map(work => `
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all relative">
                             <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button class="bg-white/90 p-2 rounded-full text-blue-600 hover:text-blue-700 shadow-sm edit-work" data-id="${work.id}">
                                    <i data-lucide="edit-2" width="16"></i>
                                </button>
                                <button class="bg-white/90 p-2 rounded-full text-red-600 hover:text-red-700 shadow-sm delete-work" data-id="${work.id}">
                                    <i data-lucide="trash" width="16"></i>
                                </button>
                            </div>
                             <div class="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                                <img src="${work.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold text-gray-800 truncate">${work.title}</h3>
                                <div class="flex justify-between items-center mt-1">
                                    <span class="text-xs font-semibold text-[#059669] bg-emerald-50 px-2 py-1 rounded-md inline-block">
                                        ${work.category || 'General'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Editor Modal -->
                <div id="editorModal" class="fixed inset-0 bg-slate-900/80 z-50 hidden items-center justify-center p-4 backdrop-blur-sm">
                    <div class="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col h-[90vh]">
                         <div class="flex justify-between items-center mb-4 shrink-0">
                            <h3 class="text-xl font-bold text-gray-800" id="modalTitle">Subir Trabajo</h3>
                            <button id="closeEditor" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" width="24"></i></button>
                        </div>
                        
                        <div class="flex-1 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center mb-4">
                            <canvas id="editorCanvas" class="max-w-full max-h-full shadow-lg"></canvas>
                        </div>

                        <div class="flex flex-col gap-4 shrink-0">
                            <div class="flex justify-center gap-4">
                                <button id="rotateBtn" type="button" class="p-3 bg-gray-100 rounded-xl hover:bg-gray-200" title="Rotar 90°">
                                    <i data-lucide="rotate-cw" width="20"></i>
                                </button>
                                <button id="cropBtn" type="button" class="p-3 bg-gray-100 rounded-xl hover:bg-gray-200" title="Recortar (Centro)">
                                    <i data-lucide="crop" width="20"></i>
                                </button>
                                <button id="resizeBtn" type="button" class="p-3 bg-gray-100 rounded-xl hover:bg-gray-200" title="Redimensionar (50%)">
                                    <i data-lucide="minimize-2" width="20"></i>
                                </button>
                            </div>

                            <div class="border-t border-gray-100 pt-4">
                                <form id="saveForm" class="flex flex-wrap gap-4 items-end">
                                    <input type="hidden" name="id" id="workId">
                                    <div class="flex-1 min-w-[200px]">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Título</label>
                                        <input name="title" id="workTitle" required class="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Ej: Uñas Acrílicas" />
                                    </div>
                                    <div class="flex-1 min-w-[200px]">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
                                        <select name="category" id="workCategory" class="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium">
                                            <option>Acrílicas</option>
                                            <option>Semipermanente</option>
                                            <option>Manicura Rusa</option>
                                            <option>Nail Art</option>
                                        </select>
                                    </div>
                                    <button type="submit" id="saveSubmitBtn" class="bg-[#059669] hover:bg-emerald-700 text-white px-8 py-2 rounded-xl font-bold h-[42px] transition-colors shadow-lg shadow-emerald-600/20">
                                        Guardar en Nube
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        // Elements
        const fileInput = document.getElementById('fileInput');
        const editorModal = document.getElementById('editorModal');
        const editorCanvas = document.getElementById('editorCanvas');
        const ctx = editorCanvas.getContext('2d');
        let currentImage = null;
        let editingId = null;

        // Upload Button -> Trigger Input
        document.getElementById('uploadBtn').addEventListener('click', () => {
            editingId = null; 
            document.getElementById('modalTitle').textContent = 'Subir Nuevo Trabajo';
            document.getElementById('saveForm').reset();
            document.getElementById('workId').value = '';
            fileInput.click();
        });

        // File Input Change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        currentImage = img;
                        // Reset Canvas
                        editorCanvas.width = img.width;
                        editorCanvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        // Open Editor
                        editorModal.classList.remove('hidden');
                        editorModal.classList.add('flex');
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
            // Reset input
            fileInput.value = '';
        });

        // Close Editor
        document.getElementById('closeEditor').addEventListener('click', () => {
            editorModal.classList.add('hidden');
            editorModal.classList.remove('flex');
        });

        // --- Editor Tools ---

        // Rotate 90 deg
        document.getElementById('rotateBtn').addEventListener('click', () => {
            if (!currentImage && !editorCanvas) return;
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = editorCanvas.height;
            tempCanvas.height = editorCanvas.width;
            tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            tempCtx.rotate(90 * Math.PI / 180);
            tempCtx.drawImage(editorCanvas, -editorCanvas.width / 2, -editorCanvas.height / 2);
            editorCanvas.width = tempCanvas.width;
            editorCanvas.height = tempCanvas.height;
            ctx.drawImage(tempCanvas, 0, 0);
        });

        // Simple Center Crop
        document.getElementById('cropBtn').addEventListener('click', () => {
            const size = Math.min(editorCanvas.width, editorCanvas.height);
            const startX = (editorCanvas.width - size) / 2;
            const startY = (editorCanvas.height - size) / 2;
            const imageData = ctx.getImageData(startX, startY, size, size);
            editorCanvas.width = size;
            editorCanvas.height = size;
            ctx.putImageData(imageData, 0, 0);
        });

        // Resize (50%)
        document.getElementById('resizeBtn').addEventListener('click', () => {
            const newWidth = editorCanvas.width * 0.5;
            const newHeight = editorCanvas.height * 0.5;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;
            tempCanvas.getContext('2d').drawImage(editorCanvas, 0, 0, newWidth, newHeight);
            editorCanvas.width = newWidth;
            editorCanvas.height = newHeight;
            ctx.drawImage(tempCanvas, 0, 0);
        });

        // Save Logic (PERSISTENT TO MYSQL)
        document.getElementById('saveForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('saveSubmitBtn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin" width="16"></i> Guardando...';
            submitBtn.disabled = true;
            lucide.createIcons();

            const formData = new FormData(e.target);
            // Get Data URL from Canvas (Compressing slightly to relieve DB load)
            const finalImage = editorCanvas.toDataURL('image/jpeg', 0.8);
            const title = formData.get('title');
            const category = formData.get('category');

            try {
                let response;
                if (editingId) {
                    response = await api.put(\`/gallery/\${editingId}\`, { title, category, image: finalImage });
                } else {
                    response = await api.post('/gallery', { title, category, image: finalImage });
                }

                if (!response.error) {
                    editorModal.classList.add('hidden');
                    editorModal.classList.remove('flex');
                    await fetchAndRender(); // Fetch directly from MySQL to re-paint
                    api.showToast(editingId ? 'Diseño actualizado' : 'Diseño subido con éxito', false);
                } else {
                    api.showToast(response.error, true);
                }
            } catch (err) {
                api.showToast("Error de conexión al servidor", true);
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });

        // Delete Logic (PERSISTENT TO MYSQL)
        document.querySelectorAll('.delete-work').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('¿Eliminar diseño del servidor permanentemente?')) {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const response = await api.delete(\`/gallery/\${id}\`);
                    if (!response.error) {
                        api.showToast('Diseño eliminado', false);
                        await fetchAndRender();
                    } else {
                        api.showToast(response.error, true);
                    }
                }
            });
        });

        // Edit Modal Trigger
        document.querySelectorAll('.edit-work').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const work = works.find(w => w.id === id);
                if (work) {
                    editingId = id;
                    document.getElementById('modalTitle').textContent = 'Editar Trabajo';
                    document.getElementById('workId').value = id;
                    document.getElementById('workTitle').value = work.title;
                    document.getElementById('workCategory').value = work.category || 'Acrílicas';

                    const img = new Image();
                    img.onload = () => {
                        currentImage = img;
                        editorCanvas.width = img.width;
                        editorCanvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        editorModal.classList.remove('hidden');
                        editorModal.classList.add('flex');
                    };
                    img.src = work.image;
                }
            });
        });
    };

    // Initial Trigger (Calls API, then renders)
    await fetchAndRender();
};
