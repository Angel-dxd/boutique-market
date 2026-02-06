import { navigateTo } from '../app.js';
// We would import market features here

export const renderMarketLayout = () => {
    const app = document.getElementById('app');

    // Basic Layout Shell
    app.innerHTML = `
        <div class="flex min-h-screen bg-gray-50">
            <!-- Sidebar -->
            <aside class="w-20 lg:w-64 bg-slate-900 text-white flex flex-col fixed h-full transition-all duration-300 z-50">
                <div class="p-6 flex justify-center lg:justify-start items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/50">
                        G
                    </div>
                    <span class="font-black text-xl hidden lg:block tracking-tight text-white">GALLO AZUL</span>
                </div>

                <nav class="flex-1 mt-6 px-4 space-y-2">
                    <a href="/market" data-link
                        class="nav-item flex items-center gap-3 p-3 rounded-xl bg-indigo-600 text-white transition-colors">
                        <i data-lucide="layout-dashboard"></i>
                        <span class="hidden lg:block font-bold">Dashboard</span>
                    </a>
                    <a href="/market/pedidos" data-link
                        class="nav-item flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="shopping-cart"></i>
                        <span class="hidden lg:block font-bold">Pedidos</span>
                    </a>
                     <a href="/market/inventario" data-link
                        class="nav-item flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="package"></i>
                        <span class="hidden lg:block font-bold">Inventario</span>
                    </a>
                     <a href="/market/proveedores" data-link
                        class="nav-item flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="users"></i>
                        <span class="hidden lg:block font-bold">Proveedores</span>
                    </a>
                    <a href="/market/estadisticas" data-link
                        class="nav-item flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="bar-chart-2"></i>
                        <span class="hidden lg:block font-bold">Estadísticas</span>
                    </a>
                    
                    <div class="pt-4 mt-4 border-t border-slate-700">
                        <button id="logoutBtn"
                            class="w-full nav-item flex items-center gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                            <i data-lucide="log-out"></i>
                            <span class="hidden lg:block font-bold">Cerrar Sesión</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 ml-20 lg:ml-64 p-8">
                <div id="layout-content" class="max-w-7xl mx-auto">
                    <!-- Dynamic Page Content -->
                </div>
            </main>
        </div>
    `;

    lucide.createIcons();

    // Bind Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        navigateTo('/logout-confirmation', { from: 'market' });
    });

    // Determine sub-route content
    const path = window.location.pathname;
    const contentContainer = document.getElementById('layout-content');

    if (path === '/market') {
        import('../features/market/home.js').then(m => m.renderMarketHome(contentContainer));
    } else if (path === '/market/pedidos') {
        import('../features/market/pedidos.js').then(m => m.renderPedidos(contentContainer));
    } else if (path === '/market/proveedores') {
        import('../features/market/proveedores.js').then(m => m.renderProveedores(contentContainer));
    } else if (path === '/market/inventario') {
        import('../features/market/inventario.js').then(m => m.renderInventario(contentContainer));
    } else if (path === '/market/estadisticas') {
        import('../features/market/estadisticas.js').then(m => m.renderEstadisticas(contentContainer));
    } else {
        contentContainer.innerHTML = `<h2 class="text-2xl font-bold">WIP: ${path}</h2>`;
    }
};
