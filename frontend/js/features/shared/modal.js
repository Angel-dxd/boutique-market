/**
 * shared/modal.js
 * Modal de confirmación genérico para acciones destructivas o críticas.
 * Reemplaza el uso de window.confirm().
 */

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
