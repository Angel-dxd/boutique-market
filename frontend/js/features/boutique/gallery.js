import { api } from '../core/api.js';

export const renderInstagramGallery = (container) => {
    let works = [];
    let isLoading = true;
    let editingId = null;
    let deletingId = null;
    let cropper = null;
    let currentFilter = 'none';

    // 1. OBTENER DISEÑOS
    const fetchAndRender = async () => {
        isLoading = true;
        render();

        const data = await api.get('/gallery');
        
        if (!data.error && Array.isArray(data) && data.length > 0) {
            works = data;
        } else {
            // MOCK STATE
            works = [
                { id: 'ej1', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80', title: 'Acrílicas Cereza', source: 'mock' },
                { id: 'ej2', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80', title: 'Francesa Premium', source: 'mock' },
                { id: 'ej3', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80', title: 'Pasteles Brillo', source: 'mock' }
            ];
        }
        
        isLoading = false;
        render();
    };

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // 2. CREAR O ACTUALIZAR
    const handleSave = async (e) => {
        e.preventDefault();
        const title = document.getElementById('nailTitle').value;
        const fileInput = document.getElementById('nailFile');
        const btn = document.getElementById('saveNailBtn');
        const originalText = btn.innerHTML;

        let base64Image = null;

        // Validar si es nuevo y no hay cropper
        if (!editingId && !cropper) {
            return api.showToast('Debes seleccionar una imagen local', true);
        }

        btn.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i> Guardando...';
        btn.disabled = true;
        lucide.createIcons();

        if (cropper) {
            // Generar el canvas recortado
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 800,
                height: 800,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });
            
            // Si hay filtro que no sea 'none', lo aplicamos físicamente a un nuevo canvas
            if (currentFilter !== 'none') {
                const filteredCanvas = document.createElement('canvas');
                filteredCanvas.width = croppedCanvas.width;
                filteredCanvas.height = croppedCanvas.height;
                const ctx = filteredCanvas.getContext('2d');
                ctx.filter = currentFilter;
                ctx.drawImage(croppedCanvas, 0, 0);
                base64Image = filteredCanvas.toDataURL('image/jpeg', 0.85);
            } else {
                base64Image = croppedCanvas.toDataURL('image/jpeg', 0.85);
            }
        }

        let response;
        if (editingId) {
            const currentWork = works.find(w => String(w.id) === String(editingId));
            response = await api.put(`/gallery/${editingId}`, { 
                title, 
                category: 'Unas', 
                image: base64Image || currentWork.image 
            });
        } else {
            response = await api.post('/gallery', { title, category: 'Unas', image: base64Image });
        }
        
        if (!response.error) {
            api.showToast(editingId ? 'Obra actualizada correctamente' : 'Obra añadida exitosamente', false);
            closeModal();
            await fetchAndRender();
        } else {
            api.showToast(response.error, true);
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
        lucide.createIcons();
    };

    // 3. CONFIRMAR BORRADO (MODAL PROFESIONAL)
    const confirmDelete = async () => {
        if (!deletingId) return;
        
        const btn = document.getElementById('confirmDeleteBtn');
        const original = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i>';
        
        const res = await api.delete(`/gallery/${deletingId}`);
        if (!res.error) {
            api.showToast('Trabajo eliminado del catálogo', false);
            closeDeleteModal();
            await fetchAndRender();
        } else {
            api.showToast(res.error, true);
        }
        
        btn.innerHTML = original;
    };

    // CONTROLES DE MODALES
    const openModal = (id = null, title = '', imageUrl = '') => {
        editingId = id;
        document.getElementById('nailTitle').value = title;
        document.getElementById('nailFile').value = '';
        
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        currentFilter = 'none';
        document.getElementById('filtersContainer').classList.add('hidden');
        document.getElementById('changePhotoBtn').classList.add('hidden');
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('ring-2', 'ring-emerald-500'));
        document.querySelector('.filter-btn[data-filter="none"]')?.classList.add('ring-2', 'ring-emerald-500');

        const fotoLabel = document.getElementById('fotoLabel');
        const formTitle = document.getElementById('formTitle');
        
        if (id && imageUrl) {
            // MODO EDICION: Mostrar foto actual
            formTitle.innerHTML = '<i data-lucide="pencil" class="text-emerald-500 w-8 h-8"></i> <span class="text-2xl font-black">Editar Trabajo</span>';
            fotoLabel.innerText = 'Fotografía (Ajusta el encuadre)';
            initCropper(imageUrl);
        } else {
            // MODO CREACION
            document.getElementById('previewImage').src = '';
            document.getElementById('uploadPlaceholder').classList.remove('hidden');
            document.getElementById('previewContainer').classList.add('hidden');
            formTitle.innerHTML = '<i data-lucide="image-plus" class="text-emerald-500 w-8 h-8"></i> <span class="text-2xl font-black">Añadir Foto</span>';
            fotoLabel.innerText = 'Seleccionar Fotografía';
        }
        
        document.getElementById('nailModalOverlay').classList.remove('hidden');
        document.getElementById('nailModalOverlay').classList.add('flex');
        lucide.createIcons();
    };

    const closeModal = () => {
        document.getElementById('nailModalOverlay').classList.add('hidden');
        document.getElementById('nailModalOverlay').classList.remove('flex');
        editingId = null;
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    };

    const openDeleteModal = (id) => {
        deletingId = id;
        document.getElementById('deleteModalOverlay').classList.remove('hidden');
        document.getElementById('deleteModalOverlay').classList.add('flex');
    };

    const closeDeleteModal = () => {
        deletingId = null;
        document.getElementById('deleteModalOverlay').classList.add('hidden');
        document.getElementById('deleteModalOverlay').classList.remove('flex');
    };

    const applyFilterToPreview = () => {
        const previewImages = document.querySelectorAll('.cropper-canvas img, .cropper-view-box img');
        previewImages.forEach(img => {
            img.style.filter = currentFilter;
        });
    };

    const initCropper = (url) => {
        const img = document.getElementById('previewImage');
        img.src = url;
        document.getElementById('uploadPlaceholder').classList.add('hidden');
        document.getElementById('previewContainer').classList.remove('hidden');
        document.getElementById('filtersContainer').classList.remove('hidden');
        document.getElementById('changePhotoBtn').classList.remove('hidden');
        
        if (cropper) cropper.destroy();
        
        // Timeout para asegurar que la imagen se ha cargado en el DOM antes de inicializar
        setTimeout(() => {
            cropper = new Cropper(img, {
                aspectRatio: 1, // Cuadrado estricto
                viewMode: 1,
                dragMode: 'move',
                background: false,
                autoCropArea: 1,
                cropBoxMovable: true,
                cropBoxResizable: true,
                guides: true,
                ready: function () {
                    applyFilterToPreview();
                }
            });
        }, 50);
    };

    const handleFilePreview = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) return api.showToast('La foto excede 10MB', true);
            const previewUrl = URL.createObjectURL(file);
            initCropper(previewUrl);
        }
    };

    const getSkeletons = () => Array(4).fill(0).map(() => `
        <div class="bg-gray-50 rounded-[2rem] shadow-sm aspect-square animate-pulse w-full"></div>
    `).join('');

    const render = () => {
        container.innerHTML = `
            <div class="space-y-8 animate-in fade-in zoom-in-95 duration-500 relative">
                
                <!-- Encabezado Clásico -->
                <div class="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-6">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
                            <i data-lucide="briefcase" width="28"></i>
                        </div>
                        <div>
                            <h2 class="text-3xl font-black text-gray-800 tracking-tight">Mis Uñas</h2>
                            <p class="text-gray-500 font-medium tracking-wide">Catálogo de Trabajos</p>
                        </div>
                    </div>
                    
                    <button id="addLocalBtn" class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 transition-transform hover:-translate-y-1 active:scale-95 w-full md:w-auto font-bold text-lg">
                        <i data-lucide="plus" class="w-6 h-6"></i> Añadir Foto
                    </button>
                </div>
                
                <!-- GRID: Tarjetas Claras con Funciones Visibles -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${isLoading ? getSkeletons() : works.map(w => `
                        <!-- Tarjeta de Contenido -->
                        <div class="bg-white rounded-[2rem] shadow-md border border-gray-100 overflow-hidden group transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-100">
                            
                            <!-- Foto Cuadrada Estricta -->
                            <div class="relative w-full aspect-square bg-gray-50 shrink-0 border-b border-gray-50">
                                <img src="${w.image}" alt="${w.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                            </div>
                            
                            <!-- Pie Fijo con Botones Visibles -->
                            <div class="p-5 flex items-center justify-between gap-3 bg-white grow">
                                <h4 class="font-bold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight flex-1">
                                    ${w.title}
                                </h4>
                                
                                ${w.source !== 'mock' ? `
                                <div class="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button class="edit-btn p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer" title="Modificar" data-id="${w.id}" data-title="${w.title}" data-image="${w.image}">
                                        <i data-lucide="pencil" class="w-4 h-4"></i>
                                    </button>
                                    <button class="delete-btn p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer" title="Borrar" data-id="${w.id}">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>` : `
                                <span class="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Demo</span>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- MODAL DE SUBIDA/EDICIÓN (Estilo Idéntico a Clientes) -->
            <div id="nailModalOverlay" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm hidden items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 class="text-xl font-bold text-gray-800" id="formTitle"></h3>
                        <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i data-lucide="x" width="24"></i>
                        </button>
                    </div>
                    
                    <form id="newNailForm" class="p-6 space-y-5">
                        
                        <!-- Título -->
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Título del Trabajo</label>
                            <input type="text" id="nailTitle" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800" placeholder="P Ej. Efecto Espejo Rosa..." />
                        </div>

                        <!-- Foto -->
                        <div class="space-y-1">
                            <div class="flex justify-between items-end">
                                <label id="fotoLabel" class="text-xs font-bold text-gray-500 uppercase tracking-widest">Fotografía</label>
                                <button type="button" id="changePhotoBtn" class="hidden text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md transition-colors"><i data-lucide="upload" class="w-3 h-3 inline"></i> Cambiar</button>
                            </div>
                            <div class="relative w-full aspect-square border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-emerald-50/30 hover:border-emerald-300 transition-all text-center overflow-hidden group">
                                <input type="file" id="nailFile" accept="image/jpeg, image/png, image/webp" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
                                
                                <div id="uploadPlaceholder" class="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none">
                                    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:scale-110 group-hover:text-emerald-500 transition-all mb-2">
                                        <i data-lucide="image-plus" class="w-6 h-6"></i>
                                    </div>
                                    <span class="text-sm font-bold text-gray-700 block mb-1">Buscar foto en PC o Móvil</span>
                                </div>

                                <div id="previewContainer" class="absolute inset-0 hidden bg-black z-[60]">
                                    <img id="previewImage" src="" class="block max-w-full" />
                                </div>
                            </div>
                        </div>

                        <!-- Filtros (Visible solo cuando hay foto) -->
                        <div id="filtersContainer" class="hidden space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Filtros</label>
                            <div class="flex gap-2 overflow-x-auto pb-2">
                                <button type="button" class="filter-btn flex-1 py-2 px-3 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-200 active:scale-95 transition-all" data-filter="none">Original</button>
                                <button type="button" class="filter-btn flex-1 py-2 px-3 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 active:scale-95 transition-all" data-filter="grayscale(100%)">B/N</button>
                                <button type="button" class="filter-btn flex-1 py-2 px-3 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200 active:scale-95 transition-all" data-filter="sepia(80%)">Cálido</button>
                                <button type="button" class="filter-btn flex-1 py-2 px-3 bg-slate-800 text-white rounded-lg text-xs font-bold border border-slate-900 active:scale-95 transition-all" data-filter="contrast(150%) saturate(120%)">Vívido</button>
                            </div>
                        </div>

                        <div class="pt-4 flex gap-3">
                            <button type="button" id="cancelModalBtn" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" id="saveNailBtn" class="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL DE BORRADO PROFESIONAL -->
            <div id="deleteModalOverlay" class="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md hidden items-center justify-center p-4">
                <div class="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center shadow-2xl animate-in zoom-in duration-200 border border-red-50">
                    <div class="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <i data-lucide="trash-2" class="w-12 h-12"></i>
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 mb-3 tracking-tight">¿Eliminar Trabajo?</h3>
                    <p class="text-gray-500 mb-8 font-medium">Si eliminas esta fotografía desaparecerá permanentemente de la galería principal.</p>
                    <div class="flex gap-3">
                        <button id="cancelDeleteBtn" class="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-colors">Abortar</button>
                        <button id="confirmDeleteBtn" class="flex-1 px-4 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-red-500/30">Sí, eliminar</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        // Limpiezas y Enlaces de Eventos
        document.getElementById('addLocalBtn')?.addEventListener('click', () => openModal(null, '', ''));
        
        document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
        document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
        const overlay = document.getElementById('nailModalOverlay');
        if (overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        document.getElementById('newNailForm')?.addEventListener('submit', handleSave);
        document.getElementById('nailFile')?.addEventListener('change', handleFilePreview);
        
        document.getElementById('changePhotoBtn')?.addEventListener('click', () => {
            document.getElementById('nailFile').click();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('ring-2', 'ring-emerald-500'));
                e.target.classList.add('ring-2', 'ring-emerald-500');
                currentFilter = e.target.getAttribute('data-filter');
                if (cropper) {
                    applyFilterToPreview();
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(btn.getAttribute('data-id'), btn.getAttribute('data-title'), btn.getAttribute('data-image'));
            });
        });

        // Eventos Borrado Pofesional
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDeleteModal(btn.getAttribute('data-id'));
            });
        });

        document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
        
        const deleteOverlay = document.getElementById('deleteModalOverlay');
        if (deleteOverlay) deleteOverlay.addEventListener('click', (e) => {
            if (e.target === deleteOverlay) closeDeleteModal();
        });
    };

    fetchAndRender();
};
