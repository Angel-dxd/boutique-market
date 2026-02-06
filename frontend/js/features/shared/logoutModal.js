import { navigateTo } from '../../app.js';

export const renderLogoutModal = (fromTheme = 'boutique') => {
    const app = document.getElementById('app');

    // Theme Config
    const isMarket = fromTheme === 'market';
    const color = isMarket ? 'bg-[#0077b6]' : 'bg-[#059669]';
    const name = isMarket ? 'El Gallo Azul' : 'Oh-Nails';

    // We overlay this on top of current view, BUT since we route to pages, 
    // we can treat this as a page or an overlay. Logic suggests it's a page in React router 
    // but here let's make it a full screen takeover.

    app.innerHTML = `
        <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-in zoom-in duration-200">
                <div class="w-16 h-16 rounded-full ${color} text-white flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <i data-lucide="log-out" width="32"></i>
                </div>

                <h2 class="text-2xl font-bold text-gray-800 mb-2">¿Cerrar Sesión?</h2>
                <p class="text-gray-500 text-sm mb-8">
                    Estás saliendo de <span class="font-bold">${name}</span>.
                </p>

                <div class="space-y-3">
                    <button id="confirmLogout" class="w-full ${color} hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all shadow-md">
                        Confirmar Salida
                    </button>
                    <button id="cancelLogout" class="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();

    document.getElementById('confirmLogout').addEventListener('click', () => {
        navigateTo('/');
    });

    document.getElementById('cancelLogout').addEventListener('click', () => {
        history.back(); // Go back to where we were
    });
};
