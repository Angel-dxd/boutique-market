import { navigateTo } from '../core/app.js';

const NAV_ITEMS = [
    { href: '/market',              icon: 'layout-dashboard', label: 'Inicio',       mobileLabel: 'Inicio' },
    { href: '/market/pedidos',      icon: 'shopping-cart',    label: 'Pedidos',      mobileLabel: 'Pedidos' },
    { href: '/market/inventario',   icon: 'package',          label: 'Inventario',   mobileLabel: 'Stock' },
    { href: '/market/proveedores',  icon: 'users',            label: 'Proveedores',  mobileLabel: 'Socios' },
    { href: '/market/estadisticas', icon: 'bar-chart-2',      label: 'Estadísticas', mobileLabel: 'Stats' },
];

let marketLayoutMounted = false;

export const renderMarketLayout = () => {
    const app = document.getElementById('app');
    const path = window.location.hash.slice(1).replace(/\/+$/, '') || '/market';

    if (!marketLayoutMounted) {
        app.innerHTML = `
            <div class="flex min-h-screen bg-gray-50">
                <!-- Sidebar (solo md+) -->
                <aside class="hidden md:flex w-20 lg:w-64 bg-slate-900 text-white flex-col fixed h-full transition-all duration-300 z-50">
                    <div class="p-4 md:p-6 flex justify-center lg:justify-start items-center gap-3">
                        <div class="w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-indigo-500/50">G</div>
                        <span class="font-black text-xl hidden lg:block tracking-tight text-white">GALLO AZUL</span>
                    </div>
                    <nav id="market-sidebar-nav" class="flex-1 mt-4 md:mt-6 px-2 md:px-4 space-y-2">
                        ${renderSidebar(path)}
                        <div class="pt-4 mt-4 border-t border-slate-700">
                            <button id="logoutBtn"
                                class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                                <i data-lucide="log-out" class="w-5 h-5 md:w-6 md:h-6"></i>
                                <span class="hidden lg:block font-bold">Cerrar Sesión</span>
                            </button>
                        </div>
                    </nav>
                </aside>

                <!-- Main Content -->
                <main class="flex-1 md:ml-20 lg:ml-64 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden pb-24 md:pb-8">
                    <div id="layout-content" class="max-w-7xl mx-auto"></div>
                </main>

                <!-- Bottom Nav (solo móvil) -->
                <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-50">
                    <div class="flex items-stretch justify-around h-16">
                        ${NAV_ITEMS.map(item => {
                            const isActive = path === item.href;
                            return `
                            <a href="${item.href}" data-link class="relative flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${
                                isActive ? 'text-indigo-600' : 'text-gray-400'
                            }">
                                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                                <span class="text-[10px] font-bold leading-none">${item.mobileLabel || item.label}</span>
                                ${isActive ? '<div class="absolute top-0 w-8 h-0.5 bg-indigo-500 rounded-full"></div>' : ''}
                            </a>`;
                        }).join('')}
                        <button id="logoutBtnMobile" class="relative flex flex-col items-center justify-center flex-1 gap-0.5 text-red-400">
                            <i data-lucide="log-out" class="w-5 h-5"></i>
                            <span class="text-[10px] font-bold leading-none">Salir</span>
                        </button>
                    </div>
                </nav>
            </div>`;

        lucide.createIcons();

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            marketLayoutMounted = false;
            navigateTo('/logout-confirmation', { from: 'market' });
        });
        document.getElementById('logoutBtnMobile')?.addEventListener('click', () => {
            marketLayoutMounted = false;
            navigateTo('/logout-confirmation', { from: 'market' });
        });

        marketLayoutMounted = true;
    } else {
        // Actualizar sidebar activo
        document.getElementById('market-sidebar-nav').innerHTML = `
            ${renderSidebar(path)}
            <div class="pt-4 mt-4 border-t border-slate-700">
                <button id="logoutBtn"
                    class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                    <i data-lucide="log-out" class="w-5 h-5 md:w-6 md:h-6"></i>
                    <span class="hidden lg:block font-bold">Cerrar Sesión</span>
                </button>
            </div>`;

        // Actualizar bottom nav activo
        const bottomNav = document.querySelector('nav.md\\:hidden .flex');
        if (bottomNav) {
            bottomNav.querySelectorAll('a[data-link]').forEach(a => {
                const isActive = a.getAttribute('href') === path;
                a.className = `relative flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`;
                
                // Ensure the active indicator exists or is removed
                const indicator = a.querySelector('.absolute.top-0');
                if (isActive && !indicator) {
                    a.insertAdjacentHTML('beforeend', '<div class="absolute top-0 w-8 h-0.5 bg-indigo-500 rounded-full"></div>');
                } else if (!isActive && indicator) {
                    indicator.remove();
                }
            });
        }

        lucide.createIcons();
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            marketLayoutMounted = false;
            navigateTo('/logout-confirmation', { from: 'market' });
        });
    }

    // Skeleton mientras carga
    const contentContainer = document.getElementById('layout-content');
    contentContainer.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-8 bg-gray-200 rounded-2xl w-1/2"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div class="h-24 bg-gray-100 rounded-2xl"></div>
                <div class="h-24 bg-gray-100 rounded-2xl"></div>
                <div class="h-24 bg-gray-100 rounded-2xl"></div>
            </div>
            <div class="h-52 bg-gray-100 rounded-2xl"></div>
        </div>`;

    if (path === '/market') {
        import('./home.js').then(m => m.renderMarketHome(contentContainer));
    } else if (path === '/market/pedidos') {
        import('./pedidos.js').then(m => m.renderPedidos(contentContainer));
    } else if (path === '/market/proveedores') {
        import('./proveedores.js').then(m => m.renderProveedores(contentContainer));
    } else if (path === '/market/inventario') {
        import('./inventario.js').then(m => m.renderInventario(contentContainer));
    } else if (path === '/market/estadisticas') {
        import('./estadisticas.js').then(m => m.renderEstadisticas(contentContainer));
    } else {
        contentContainer.innerHTML = `<h2 class="text-xl font-bold">WIP: ${path}</h2>`;
    }
};

const renderSidebar = (activePath) => NAV_ITEMS.map(item => {
    const isActive = activePath === item.href;
    return `
        <a href="${item.href}" data-link
            class="nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-colors
            ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}">
            <i data-lucide="${item.icon}" class="w-5 h-5 md:w-6 md:h-6"></i>
            <span class="hidden lg:block font-bold">${item.label}</span>
        </a>`;
}).join('');
