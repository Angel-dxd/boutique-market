/**
 * shared/modal.js
 * Modal de confirmación genérico para acciones destructivas o críticas.
 * Reemplaza el uso de window.confirm().
 */
import { api } from '../core/api.js';

/**
 * Muestra un modal de confirmación personalizado.
 * @param {string} title - Título del modal.
 * @param {string} message - Mensaje descriptivo.
 * @param {string} [confirmText='Aceptar'] - Texto del botón de confirmación.
 * @param {string} [cancelText='Cancelar'] - Texto del botón de cancelación.
 * @returns {Promise<boolean>} Resuelve a true si se confirma, false si se cancela.
 */
export const showConfirm = (title, message, confirmText = 'Aceptar', cancelText = 'Cancelar') => {
    return new Promise((resolve) => {
        // Create modal container
        const modalEl = document.createElement('div');
        modalEl.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 opacity-0 transition-opacity duration-300';
        
        modalEl.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
                <div class="p-6">
                    <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                        <i data-lucide="alert-triangle" width="24"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
                    <p class="text-gray-500 text-sm mb-6">${message}</p>
                    
                    <div class="flex gap-3">
                        <button id="modal-cancel-btn" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                            ${cancelText}
                        </button>
                        <button id="modal-confirm-btn" class="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);

        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons({ root: modalEl });
        }

        // Animate in
        requestAnimationFrame(() => {
            modalEl.classList.remove('opacity-0');
            modalEl.querySelector('div > div').classList.remove('scale-95');
        });

        const close = (result) => {
            modalEl.classList.add('opacity-0');
            modalEl.querySelector('div > div').classList.add('scale-95');
            setTimeout(() => {
                modalEl.remove();
                resolve(result);
            }, 300);
        };

        modalEl.querySelector('#modal-cancel-btn').addEventListener('click', () => close(false));
        modalEl.querySelector('#modal-confirm-btn').addEventListener('click', () => close(true));
        
        // Optional: click outside to close
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) close(false);
        });
    });
};

/**
 * Muestra un modal elegante para cambiar la contraseña del usuario.
 * Adapta su esquema de colores según el tenant actual.
 * @returns {Promise<void>}
 */
export const showChangePasswordModal = () => {
    return new Promise((resolve) => {
        const currentUser = localStorage.getItem('currentUser') || 'market';
        const isSanti = currentUser === 'santi';
        const accent = isSanti ? 'indigo' : 'emerald';

        const modalEl = document.createElement('div');
        modalEl.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 opacity-0 transition-opacity duration-300';
        
        modalEl.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md transform scale-95 transition-transform duration-300 overflow-hidden">
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 rounded-full bg-${accent}-50 text-${accent}-500 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="key-round" width="24"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">Cambiar Contraseña</h3>
                            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Seguridad de la Cuenta</p>
                        </div>
                    </div>

                    <form id="change-pwd-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Contraseña Actual</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                    <i data-lucide="lock" width="16"></i>
                                </span>
                                <input type="password" name="currentPassword" required autocomplete="current-password"
                                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${accent}-400 focus:bg-white text-sm transition-all font-semibold text-gray-800"
                                    placeholder="Contraseña actual" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nueva Contraseña</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                    <i data-lucide="shield-check" width="16"></i>
                                </span>
                                <input type="password" name="newPassword" required autocomplete="new-password"
                                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${accent}-400 focus:bg-white text-sm transition-all font-semibold text-gray-800"
                                    placeholder="Mínimo 3 caracteres" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Confirmar Nueva Contraseña</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                    <i data-lucide="shield-alert" width="16"></i>
                                </span>
                                <input type="password" name="confirmPassword" required autocomplete="new-password"
                                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${accent}-400 focus:bg-white text-sm transition-all font-semibold text-gray-800"
                                    placeholder="Repite la nueva contraseña" />
                            </div>
                        </div>

                        <div class="pt-4 flex gap-3">
                            <button type="button" id="pwd-cancel-btn" class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                Cancelar
                            </button>
                            <button type="submit" id="pwd-submit-btn" class="flex-1 py-3 rounded-xl bg-${accent}-600 text-white font-bold hover:bg-${accent}-700 transition-colors shadow-lg shadow-${accent}-500/20 flex justify-center items-center gap-2 text-sm">
                                <i data-lucide="check" width="16"></i> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);

        if (window.lucide) {
            window.lucide.createIcons({ root: modalEl });
        }

        requestAnimationFrame(() => {
            modalEl.classList.remove('opacity-0');
            modalEl.querySelector('div > div').classList.remove('scale-95');
        });

        const close = () => {
            modalEl.classList.add('opacity-0');
            modalEl.querySelector('div > div').classList.add('scale-95');
            setTimeout(() => {
                modalEl.remove();
                resolve();
            }, 300);
        };

        modalEl.querySelector('#pwd-cancel-btn').addEventListener('click', close);
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) close();
        });

        const form = modalEl.querySelector('#change-pwd-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            if (newPassword !== confirmPassword) {
                api.showToast('Las nuevas contraseñas no coinciden.', true);
                return;
            }

            if (newPassword.length < 3) {
                api.showToast('La nueva contraseña debe tener al menos 3 caracteres.', true);
                return;
            }

            const btn = modalEl.querySelector('#pwd-submit-btn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin" width="16"></i> Procesando...`;
            btn.disabled = true;
            if (window.lucide) window.lucide.createIcons({ root: btn });

            const res = await api.put('/auth/change-password', { currentPassword, newPassword });

            if (!res.error) {
                api.showToast('¡Contraseña cambiada exitosamente!', false);
                close();
            } else {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                if (window.lucide) window.lucide.createIcons({ root: btn });
            }
        });
    });
};

