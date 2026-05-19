/**
 * boutique/gallery.js
 * Módulo de portfolio y galería de fotos (Mis Uñas) para la Boutique.
 * Gestiona la subida de fotos, edición con Cropper, filtros y visualización.
 */
import { api } from '../core/api.js';

/**
 * Renderiza la galería de trabajos estilo Instagram.
 * @param {HTMLElement} container - El elemento donde se inyectará el HTML.
 */
export const renderInstagramGallery = (container) => {
    let works = [];
    let clients = [];
    let isLoading = true;
    let editingId = null;
    let deletingId = null;
    let detailId = null;
    let cropper = null;
    let currentFilter = 'none';
    let searchQuery = '';
    let activeCategory = 'all';
 
    let currentOffset = 0;
    const LIMIT = 12;
 
    // 1. OBTENER DISEÑOS (PAGINADOS CON SWR)
    const fetchAndRender = async (append = false) => {
        const cachedWorksKey = `cached_works_${localStorage.getItem('currentUser') || 'default'}`;

        if (!append) {
            isLoading = true;
            currentOffset = 0;
            
            // Cargar datos cacheados primero (SWR)
            try {
                const cached = localStorage.getItem(cachedWorksKey);
                if (cached) {
                    works = JSON.parse(cached);
                    isLoading = false; // Desactivar loading temporalmente para renderizado instantáneo
                }
            } catch (e) {
                console.error("Error al leer caché de galería", e);
            }
            render();
        }
 
        const data = await api.get(`/gallery?limit=${LIMIT}&offset=${currentOffset}`);
        
        if (!data.error && Array.isArray(data)) {
            if (append) {
                works = [...works, ...data];
            } else {
                works = data;
                // Guardar en caché
                try {
                    localStorage.setItem(cachedWorksKey, JSON.stringify(works));
                } catch (e) {
                    console.error("Error al guardar caché de galería", e);
                }
            }
        } else if (!append && works.length === 0) {
            // MOCK STATE (Solo si es carga inicial y falla la API y no hay caché)
            works = [
                { id: 'ej1', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80', title: 'Acrílicas Cereza', category: 'Acrílicas', source: 'mock' },
                { id: 'ej2', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80', title: 'Francesa Premium', category: 'Francesa', source: 'mock' },
                { id: 'ej3', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80', title: 'Pasteles Brillo', category: 'Nail Art', source: 'mock' }
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
        const clientIdSelect = document.getElementById('nailClient');
        const client_id = clientIdSelect ? clientIdSelect.value : null;
        const btn = document.getElementById('saveNailBtn');
        const originalText = btn.innerHTML;
 
        let base64Image = null;
 
        const files = fileInput.files ? Array.from(fileInput.files) : [];
 
        // Validar si es nuevo y no hay cropper ni archivos múltiples
        if (!editingId && !cropper && files.length <= 1) {
            return api.showToast('Debes seleccionar una imagen local', true);
        }
 
        btn.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i> Guardando...';
        btn.disabled = true;
        lucide.createIcons();
 
        // CASO: Múltiples fotos
        if (!editingId && !cropper && files.length > 1) {
            let successCount = 0;
            let index = 1;
            for (const file of files) {
                if (file.size > 10 * 1024 * 1024) continue;
                try {
                    const base64 = await toBase64(file);
                    // Usar nombre base + número, o el nombre de archivo si no hay título
                    let tempTitle = file.name.replace(/\.[^/.]+$/, "");
                    if (title) {
                        tempTitle = `${title} #${index}`;
                    }
                    const res = await api.post('/gallery', { 
                        title: tempTitle, 
                        category: 'Unas', 
                        image: base64,
                        client_id: client_id ? parseInt(client_id) : null
                    });
                    if (!res.error) {
                        successCount++;
                        index++;
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            api.showToast(`${successCount} fotos añadidas exitosamente`, false);
            closeModal();
            await fetchAndRender();
            
            btn.innerHTML = originalText;
            btn.disabled = false;
            lucide.createIcons();
            return;
        }
 
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
                //esto comprime la imagen un 7% para que no sea tan pesada
                base64Image = filteredCanvas.toDataURL('image/jpeg', 0.7);
            } else {
                //si no hay filtro, comprime la imagen un 7%
                base64Image = croppedCanvas.toDataURL('image/jpeg', 0.7);
            }
        }
 
        let response;
        if (editingId) {
            const currentWork = works.find(w => String(w.id) === String(editingId));
            response = await api.put(`/gallery/${editingId}`, { 
                title, 
                category: 'Unas', 
                image: base64Image || currentWork.image,
                client_id: client_id ? parseInt(client_id) : null
            });
        } else {
            response = await api.post('/gallery', { 
                title, 
                category: 'Unas', 
                image: base64Image,
                client_id: client_id ? parseInt(client_id) : null
            });
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
        
        const nailClientSelect = document.getElementById('nailClient');
        const currentWork = id ? works.find(w => String(w.id) === String(id)) : null;
        const clientVal = currentWork ? (currentWork.client_id || '') : '';
        
        // Cargar clientas bajo demanda si aún no se han obtenido
        if (clients.length === 0) {
            if (nailClientSelect) {
                nailClientSelect.innerHTML = '<option value="">Cargando clientas...</option>';
            }
            api.get('/clients').then(clientsRes => {
                if (!clientsRes.error) {
                    clients = clientsRes.data || clientsRes || [];
                    if (nailClientSelect) {
                        nailClientSelect.innerHTML = `
                            <option value="">No vincular</option>
                            ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        `;
                        nailClientSelect.value = clientVal;
                    }
                }
            });
        } else {
            if (nailClientSelect) nailClientSelect.value = clientVal;
        }
        
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
        // Restaurar altura original de la zona de upload
        const zone = document.getElementById('uploadZone');
        if (zone) zone.style.height = '140px';
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

    const openDetailModal = (id) => {
        detailId = id;
    };

    const closeDetailModal = () => {
        detailId = null;
        render();
    };

    const getWorkCategory = (work) => {
        if (work.category && typeof work.category === 'string' && work.category.trim()) {
            return work.category.trim();
        }
        return 'General';
    };

    const getVisibleWorks = () => {
        const query = searchQuery.trim().toLowerCase();
        return works.filter((w) => {
            const matchesSearch = !query || (w.title || '').toLowerCase().includes(query);
            const category = getWorkCategory(w);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            return matchesSearch && matchesCategory;
        });
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

        // Ampliar la zona de upload para que el cropper tenga espacio
        const zone = document.getElementById('uploadZone');
        if (zone) zone.style.height = '250px';
        
        if (cropper) cropper.destroy();
        
        setTimeout(() => {
            cropper = new Cropper(img, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                background: false,
                autoCropArea: 0.9,
                cropBoxMovable: true,
                cropBoxResizable: false, // En móvil mejor fijo para no confundir
                guides: false,
                highlight: false,
                ready: function () {
                    applyFilterToPreview();
                }
            });
        }, 50);
    };

    const handleFilePreview = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (files.length === 1) {
            const file = files[0];
            if (file.size > 10 * 1024 * 1024) return api.showToast('La foto excede 10MB', true);
            
            // Asegurar que restauramos el img si venimos de múltiples
            const container = document.getElementById('previewContainer');
            container.innerHTML = '<img id="previewImage" src="" class="block max-w-full" />';
            
            const previewUrl = URL.createObjectURL(file);
            initCropper(previewUrl);
        } else {
            // Múltiples fotos
            document.getElementById('uploadPlaceholder').classList.add('hidden');
            document.getElementById('previewContainer').classList.remove('hidden');
            document.getElementById('filtersContainer').classList.add('hidden');
            document.getElementById('changePhotoBtn').classList.remove('hidden');
            
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            
            document.getElementById('previewContainer').innerHTML = `
                <div class="h-full w-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 rounded-2xl">
                    <i data-lucide="layers" class="w-12 h-12 mb-2"></i>
                    <span class="font-bold text-lg">${files.length} fotos listas</span>
                    <span class="text-sm mt-1">Se subirán simultáneamente</span>
                </div>
            `;
            lucide.createIcons();
        }
    };

    const getSkeletons = () => Array(4).fill(0).map(() => `
        <div class="bg-gray-50 rounded-[2rem] shadow-sm aspect-square animate-pulse w-full"></div>
    `).join('');

    const render = () => {
        const categories = ['all', ...new Set(works.map(getWorkCategory))];
        const visibleWorks = getVisibleWorks();
        const detailWork = detailId ? works.find((w) => String(w.id) === String(detailId)) : null;

        container.innerHTML = `
            <div class="p-2 md:p-6 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
                
                <!-- Header Compacto -->
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-1">
                        <h1 class="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Mis Uñas</h1>
                        <button id="addLocalBtn"
                            class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200">
                            <i data-lucide="image-plus" class="w-5 h-5"></i> <span class="hidden sm:inline">Añadir Foto</span><span class="sm:hidden">Añadir</span>
                        </button>
                    </div>
                    <p class="text-gray-400 text-sm font-medium">Catálogo de Trabajos y Portfolio</p>
                </div>

                <div class="bg-white p-4 md:p-5 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-4">
                    <div class="relative flex items-center">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i data-lucide="search" class="w-5 h-5 text-gray-400"></i>
                        </div>
                        <input
                            id="gallerySearch"
                            type="text"
                            value="${searchQuery}"
                            placeholder="Buscar trabajo por nombre..."
                            class="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800"
                        />
                    </div>
                </div>
                
                <!-- GRID: Tarjetas con Efecto Turbo -->
                <div id="galleryGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                    ${isLoading && works.length === 0 ? getSkeletons() : visibleWorks.map((w, index) => `
                        <!-- Tarjeta de Contenido con Animación Escalonada -->
                        <div class="gallery-card bg-white rounded-[2rem] shadow-md border border-gray-100 overflow-hidden group flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-500" 
                             style="animation-delay: ${index * 50}ms; backface-visibility: hidden;">
                            
                            <!-- Foto Cuadrada con Skeleton Placeholder -->
                            <div class="relative w-full aspect-square bg-gray-100 shrink-0 border-b border-gray-50 cursor-pointer view-btn overflow-hidden" data-id="${w.id}">
                                <div class="absolute inset-0 bg-gray-200 animate-pulse"></div> <!-- Placeholder de fondo -->
                                <img src="${w.image}" alt="${w.title}" 
                                     class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-0" 
                                     onload="this.style.opacity='1'; this.previousElementSibling.style.display='none';"
                                     loading="lazy" />
                                
                                <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 px-2">
                                    <div class="flex gap-2">
                                        <button class="view-btn text-xs font-bold bg-white/95 text-gray-800 px-3 py-1.5 rounded-full" data-id="${w.id}">Ver</button>
                                        ${w.source !== 'mock' ? `<button class="edit-btn text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded-full" data-id="${w.id}" data-title="${w.title}" data-image="${w.image}">Editar</button>` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Pie Fijo -->
                            <div class="p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 bg-white grow">
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-gray-800 text-xs md:text-base line-clamp-2 leading-tight">
                                        ${w.title}
                                    </h4>
                                </div>
                                
                                ${w.source !== 'mock' ? `
                                <div class="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button class="edit-btn p-2 md:p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer" title="Modificar" data-id="${w.id}" data-title="${w.title}" data-image="${w.image}">
                                        <i data-lucide="pencil" class="w-3.5 h-3.5 md:w-4 md:h-4"></i>
                                    </button>
                                    <button class="delete-btn p-2 md:p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer" title="Borrar" data-id="${w.id}">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5 md:w-4 md:h-4"></i>
                                    </button>
                                </div>` : `
                                <span class="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Demo</span>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Botón Cargar Más -->
                ${!isLoading && works.length >= 12 && works.length % 12 === 0 ? `
                    <div class="flex justify-center pt-4">
                        <button id="loadMoreBtn" class="px-8 py-3 bg-white border-2 border-emerald-500 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i> Cargar más trabajos
                        </button>
                    </div>
                ` : ''}

                ${!isLoading && visibleWorks.length === 0 ? `
                    <div id="noResultsMsg" class="col-span-full bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center">
                        <i data-lucide="search-x" class="w-10 h-10 mx-auto text-gray-300 mb-3"></i>
                        <h3 class="text-lg font-bold text-gray-700">No hay resultados</h3>
                        <p class="text-sm text-gray-500 mt-1">Prueba con otra búsqueda.</p>
                    </div>
                ` : ''}
            </div>



            <!-- MODAL DE SUBIDA/EDICIÓN -->
            <!-- z-[200] > z-50 de la bottom nav, así nunca queda tapado -->
            <div id="nailModalOverlay" class="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm hidden items-start justify-center p-4 md:pt-16">
                <div class="bg-white
                            w-full rounded-t-3xl
                            md:max-w-md md:rounded-3xl
                            shadow-2xl flex flex-col overflow-hidden
                            animate-in fade-in slide-in-from-bottom-4 duration-300"
                     style="max-height: calc(100dvh - 80px);">
                    <!-- 80px = 64px bottom nav + 16px margen de aire -->

                    <!-- Header fijo -->
                    <div class="flex justify-between items-center px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                        <div id="formTitle" class="flex items-center gap-2 font-black text-gray-800 text-lg"></div>
                        <button id="closeModalBtn"
                            class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors flex-shrink-0">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <!-- Cuerpo con scroll -->
                    <form id="newNailForm" class="flex flex-col flex-1 min-h-0">
                        <div class="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                            <!-- Título -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Título del Trabajo</label>
                                <input type="text" id="nailTitle" required
                                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all font-semibold text-gray-800 text-base"
                                    placeholder="Ej. Efecto Espejo Rosa..." />
                            </div>

                            <!-- Vincular a Clienta -->
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Vincular a Clienta (Opcional)</label>
                                <select id="nailClient"
                                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all font-semibold text-gray-800 text-base">
                                    <option value="">No vincular</option>
                                    ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>

                            <!-- Foto -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center">
                                    <label id="fotoLabel" class="text-xs font-bold text-gray-400 uppercase tracking-widest">Fotografía</label>
                                    <button type="button" id="changePhotoBtn"
                                        class="hidden text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors active:scale-95">
                                        <i data-lucide="refresh-cw" class="w-3 h-3 inline mr-1"></i>Cambiar foto
                                    </button>
                                </div>

                                <!-- Zona de upload -->
                                <div id="uploadZone"
                                    class="relative border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center overflow-hidden group transition-all hover:border-emerald-400 hover:bg-emerald-50/30"
                                    style="height: 160px">
                                    <input type="file" id="nailFile" accept="image/jpeg, image/png, image/webp" multiple
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
                                    <div id="uploadPlaceholder" class="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none">
                                        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:scale-110 group-hover:text-emerald-500 transition-all mb-2">
                                            <i data-lucide="image-plus" class="w-6 h-6"></i>
                                        </div>
                                        <span class="text-sm font-bold text-gray-600">Toca para elegir una foto</span>
                                        <span class="text-xs text-gray-400 mt-1">JPG, PNG o WEBP · Máx. 10MB</span>
                                    </div>
                                    <div id="previewContainer" class="absolute inset-0 hidden bg-black z-[60]">
                                        <img id="previewImage" src="" class="block max-w-full" />
                                    </div>
                                </div>
                            </div>

                            <!-- Filtros (visibles solo cuando hay foto) -->
                            <div id="filtersContainer" class="hidden space-y-2">
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Estilo de imagen</label>
                                <div class="grid grid-cols-4 gap-2">
                                    <button type="button" class="filter-btn flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl border-2 border-indigo-200 bg-indigo-50 active:scale-95 transition-all" data-filter="none">
                                        <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 shadow-sm"></div>
                                        <span class="text-[10px] font-black text-indigo-600 uppercase leading-none">Original</span>
                                    </button>
                                    <button type="button" class="filter-btn flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl border-2 border-gray-200 bg-gray-50 active:scale-95 transition-all" data-filter="grayscale(100%)">
                                        <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-gray-300 to-gray-600 shadow-sm"></div>
                                        <span class="text-[10px] font-black text-gray-500 uppercase leading-none">B/N</span>
                                    </button>
                                    <button type="button" class="filter-btn flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl border-2 border-amber-200 bg-amber-50 active:scale-95 transition-all" data-filter="sepia(80%)">
                                        <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-sm"></div>
                                        <span class="text-[10px] font-black text-amber-700 uppercase leading-none">Cálido</span>
                                    </button>
                                    <button type="button" class="filter-btn flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl border-2 border-violet-200 bg-violet-50 active:scale-95 transition-all" data-filter="contrast(150%) saturate(120%)">
                                        <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-400 to-violet-600 shadow-sm"></div>
                                        <span class="text-[10px] font-black text-violet-700 uppercase leading-none">Vívido</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        <!-- Botones FIJOS al fondo — siempre visibles -->
                        <div class="flex-shrink-0 px-5 pb-5 pt-3 border-t border-gray-100 bg-white flex gap-3">
                            <button type="button" id="cancelModalBtn"
                                class="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-colors active:scale-95">
                                Cancelar
                            </button>
                            <button type="submit" id="saveNailBtn"
                                class="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2 active:scale-95">
                                <i data-lucide="check" class="w-4 h-4"></i> Guardar
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

            <div id="detailModalOverlay" class="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-md ${detailWork ? 'flex' : 'hidden'} items-center justify-center p-4">
                <div class="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transform transition-all">
                    ${detailWork ? `
                        <div class="relative w-full" style="padding-top: 100%;">
                            <img src="${detailWork.image}" alt="${detailWork.title}" class="absolute inset-0 w-full h-full object-cover" />
                            <!-- Gradient overlay for top -->
                            <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none"></div>
                            
                            <button id="closeDetailBtn" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all z-10 shadow-sm hover:scale-105 active:scale-95">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                            
                            ${detailWork.source === 'mock' ? `
                                <div class="absolute bottom-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5 z-10 shadow-sm">
                                    <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                    <span class="text-[10px] font-black text-white uppercase tracking-widest">Demo</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="p-6 md:p-8">
                            <div class="text-center mb-6">
                                <h3 class="text-2xl font-black text-gray-800 tracking-tight leading-tight">${detailWork.title}</h3>
                                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Portfolio Oh-Nails</p>
                            </div>
                            
                            <div class="flex gap-3">
                                ${detailWork.source !== 'mock' ? `
                                    <button id="detailEditBtn" data-id="${detailWork.id}" data-title="${detailWork.title}" data-image="${detailWork.image}" class="flex-1 py-3.5 rounded-2xl bg-gray-50 text-gray-700 font-bold border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                                        <i data-lucide="pencil" class="w-4 h-4"></i> Editar
                                    </button>
                                    <button id="detailDeleteBtn" data-id="${detailWork.id}" class="flex-1 py-3.5 rounded-2xl bg-red-50 text-red-600 font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i> Eliminar
                                    </button>
                                ` : `
                                    <button id="detailCloseBtn" class="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 active:scale-95">
                                        Cerrar Vista
                                    </button>
                                `}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        lucide.createIcons();

        // Limpiezas y Enlaces de Eventos
        document.getElementById('addLocalBtn')?.addEventListener('click', () => openModal(null, '', ''));
        
        document.getElementById('loadMoreBtn')?.addEventListener('click', async () => {
            const btn = document.getElementById('loadMoreBtn');
            const original = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i> Cargando...';
            btn.disabled = true;
            lucide.createIcons();
            
            currentOffset += LIMIT;
            await fetchAndRender(true);
        });
        document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
        document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
        const overlay = document.getElementById('nailModalOverlay');
        if (overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        document.getElementById('newNailForm')?.addEventListener('submit', handleSave);
        document.getElementById('nailFile')?.addEventListener('change', handleFilePreview);
        
        document.getElementById('changePhotoBtn')?.addEventListener('click', () => {
            document.getElementById('nailFile').click();
        });

        document.getElementById('gallerySearch')?.addEventListener('input', (e) => {
            searchQuery = e.target.value || '';
            const query = searchQuery.toLowerCase().trim();
            let visibleCount = 0;
            
            document.querySelectorAll('.gallery-card').forEach(card => {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                if (title.includes(query)) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            const noResults = document.getElementById('noResultsMsg');
            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });

        document.querySelectorAll('.gallery-filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeCategory = btn.getAttribute('data-category') || 'all';
                render();
            });
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
                closeDetailModal();
                openModal(btn.getAttribute('data-id'), btn.getAttribute('data-title'), btn.getAttribute('data-image'));
            });
        });

        document.querySelectorAll('.view-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDetailModal(btn.getAttribute('data-id'));
                render();
            });
        });

        // Eventos Borrado Pofesional
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeDetailModal();
                openDeleteModal(btn.getAttribute('data-id'));
            });
        });

        document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
        
        const deleteOverlay = document.getElementById('deleteModalOverlay');
        if (deleteOverlay) deleteOverlay.addEventListener('click', (e) => {
            if (e.target === deleteOverlay) closeDeleteModal();
        });

        document.getElementById('closeDetailBtn')?.addEventListener('click', closeDetailModal);
        document.getElementById('detailCloseBtn')?.addEventListener('click', closeDetailModal);
        document.getElementById('detailEditBtn')?.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const title = e.currentTarget.getAttribute('data-title');
            const image = e.currentTarget.getAttribute('data-image');
            closeDetailModal();
            openModal(id, title, image);
        });
        document.getElementById('detailDeleteBtn')?.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            closeDetailModal();
            openDeleteModal(id);
        });
        const detailOverlay = document.getElementById('detailModalOverlay');
        if (detailOverlay) detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) closeDetailModal();
        });
    };

    fetchAndRender();
};
