import { navigateTo } from '../core/app.js';
import { renderBoutiqueHome } from './home.js';

export const renderBoutiqueLayout = () => {
    const app = document.getElementById('app');

    // Basic Layout Shell
    app.innerHTML = `
        <div class="flex min-h-screen bg-gray-50">
            <!-- Sidebar -->
            <aside class="w-16 md:w-20 lg:w-64 bg-slate-900 text-white flex flex-col fixed h-full transition-all duration-300 z-50">
                <div class="p-4 md:p-6 flex justify-center lg:justify-start items-center gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-emerald-500/50">
                        O
                    </div>
                    <span class="font-black text-xl hidden lg:block tracking-tight text-white">OH-NAILS</span>
                </div>

                <nav class="flex-1 mt-4 md:mt-6 px-2 md:px-4 space-y-2">
                    <a href="/boutique-welcome" data-link
                        class="nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl bg-emerald-600 text-white transition-colors">
                        <i data-lucide="layout-dashboard" class="w-5 h-5 md:w-6 md:h-6"></i>
                        <span class="hidden lg:block font-bold">Resumen</span>
                    </a>
                    <a href="/boutique-welcome/clientes" data-link
                        class="nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="users" class="w-5 h-5 md:w-6 md:h-6"></i>
                        <span class="hidden lg:block font-bold">Clientes</span>
                    </a>
                     <a href="/boutique-welcome/calendario" data-link
                        class="nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="calendar" class="w-5 h-5 md:w-6 md:h-6"></i>
                        <span class="hidden lg:block font-bold">Agenda</span>
                    </a>
                     <a href="/boutique-welcome/gastos" data-link
                        class="nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="dollar-sign" class="w-5 h-5 md:w-6 md:h-6"></i>
                        <span class="hidden lg:block font-bold">Finanzas</span>
                    </a>
                    <a href="/boutique-welcome/mis-unas" data-link
                        class="nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="camera" class="w-5 h-5 md:w-6 md:h-6"></i>
                        <span class="hidden lg:block font-bold">Mis Uñas</span>
                    </a>
                    
                    <div class="pt-4 mt-4 border-t border-slate-700">
                        <button id="logoutBtn"
                            class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                            <i data-lucide="log-out" class="w-5 h-5 md:w-6 md:h-6"></i>
                            <span class="hidden lg:block font-bold">Salir</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 ml-16 md:ml-20 lg:ml-64 p-4 md:p-8 overflow-x-hidden">
                <div id="layout-content" class="max-w-7xl mx-auto">
                    <!-- Dynamic Page Content -->
                </div>
            </main>
        </div>
    `;

    lucide.createIcons();

    // Bind Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        navigateTo('/logout-confirmation', { from: 'boutique' });
    });

    // Determine sub-route content
    const path = window.location.hash.slice(1).replace(/\/+$/, '') || '/';
    const contentContainer = document.getElementById('layout-content');

    if (path === '/boutique-welcome') {
        renderBoutiqueHome(contentContainer);
    } else if (path === '/boutique-welcome/clientes') {
        import('./clients.js').then(m => m.renderClients(contentContainer));
    } else if (path === '/boutique-welcome/calendario') {
        import('./calendar.js').then(m => m.renderCalendar(contentContainer));
    } else if (path === '/boutique-welcome/gastos') {
        import('./finance.js').then(m => m.renderFinance(contentContainer));
    } else if (path === '/boutique-welcome/gift-cards') {
        // Alias for Gallery in this simplified version or implement separate
        // For now let's map it to Gallery/Works or just a placeholder if not requested explicitly? 
        // Request said: "Galería de Uñas (Gestión de Fotos): Implementa el apartado de 'Mis Uñas'" -> This usually corresponds to "mis-unas"
        contentContainer.innerHTML = '<h2>Gift Cards (WIP)</h2>';
    } else if (path === '/boutique-welcome/mis-unas') {
        import('./gallery.js').then(m => m.renderInstagramGallery(contentContainer));
    } else {
        contentContainer.innerHTML = `<h2 class="text-2xl font-bold">WIP: ${path}</h2>`;
    }
};
