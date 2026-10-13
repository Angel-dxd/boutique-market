/**
 * ariel/layout.js
 * Componente de diseño (Shell) para ARIEL.
 * Gestiona la barra lateral (sidebar), navegación móvil y carga de vistas.
 */
import { navigateTo } from '../core/app.js';

const NAV_ITEMS = [
    { href: '/dashboard',              icon: 'layout-dashboard', label: 'Inicio',       mobileLabel: 'Inicio' },
    { href: '/dashboard/rendimiento',  icon: 'wallet',           label: 'Rendimiento',  mobileLabel: 'Finanzas' },
];

let marketLayoutMounted = false;
let tabContainers = {};

/**
 * Renderiza el layout principal de Ariel.
 */
export const renderArielLayout = () => {
    const app = document.getElementById('app');
    const path = window.location.hash.slice(1).replace(/\/+$/, '') || '/dashboard';

    if (!marketLayoutMounted) {
        app.innerHTML = `
            <div class="flex min-h-screen bg-gray-50">
                <!-- Sidebar (solo md+) -->
                <aside class="hidden md:flex w-20 lg:w-64 bg-slate-900 text-white flex-col fixed h-full transition-all duration-300 z-50">
                    <div class="p-4 md:p-6 flex justify-center lg:justify-start items-center gap-3">
                        <div class="w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-indigo-500/50">A</div>
                        <span class="font-black text-xl hidden lg:block tracking-tight text-white">ARIEL</span>
                    </div>
                    <nav id="market-sidebar-nav" class="flex-1 mt-4 md:mt-6 px-2 md:px-4 space-y-2">
                        ${renderSidebar(path)}
                        <div class="pt-4 mt-4 border-t border-slate-700 space-y-1">
                            <button id="profileBtn"
                                class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                <i data-lucide="user" class="w-5 h-5 md:w-6 md:h-6"></i>
                                <span class="hidden lg:block font-bold">Perfil</span>
                            </button>
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
                        <button id="profileBtnMobile" class="relative flex flex-col items-center justify-center flex-1 gap-0.5 text-gray-400">
                            <i data-lucide="user" class="w-5 h-5"></i>
                            <span class="text-[10px] font-bold leading-none">Perfil</span>
                        </button>
                    </div>
                </nav>
            </div>`;

        lucide.createIcons();

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            marketLayoutMounted = false;
            tabContainers = {};
            navigateTo('/logout-confirmation', { from: 'market' });
        });
        document.getElementById('profileBtn')?.addEventListener('click', () => {
            navigateTo('/dashboard/perfil');
        });
        document.getElementById('profileBtnMobile')?.addEventListener('click', () => {
            navigateTo('/dashboard/perfil');
        });

        marketLayoutMounted = true;
    } else {
        // Actualizar sidebar activo
        document.getElementById('market-sidebar-nav').innerHTML = `
            ${renderSidebar(path)}
            <div class="pt-4 mt-4 border-t border-slate-700 space-y-1">
                <button id="profileBtn"
                    class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="user" class="w-5 h-5 md:w-6 md:h-6"></i>
                    <span class="hidden lg:block font-bold">Perfil</span>
                </button>
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
            tabContainers = {};
            navigateTo('/logout-confirmation', { from: 'market' });
        });
        document.getElementById('profileBtn')?.addEventListener('click', () => {
            navigateTo('/dashboard/perfil');
        });
    }

    const contentContainer = document.getElementById('layout-content');

    // Ocultar todas las pestañas cacheadas
    Object.values(tabContainers).forEach(el => el.classList.add('hidden'));

    if (tabContainers[path]) {
        // Mostrar instantáneamente si ya está en caché
        tabContainers[path].classList.remove('hidden');
        return;
    }

    // Crear un nuevo contenedor para la pestaña activa
    const tabEl = document.createElement('div');
    tabEl.className = 'w-full animate-in fade-in duration-200';
    tabContainers[path] = tabEl;
    contentContainer.appendChild(tabEl);

    // Skeleton mientras carga
    tabEl.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-8 bg-gray-200 rounded-2xl w-1/2"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div class="h-24 bg-gray-100 rounded-2xl"></div>
                <div class="h-24 bg-gray-100 rounded-2xl"></div>
                <div class="h-24 bg-gray-100 rounded-2xl"></div>
            </div>
            <div class="h-52 bg-gray-100 rounded-2xl"></div>
        </div>`;

    if (path === '/dashboard') {
        import('./home.js').then(m => m.renderMarketHome(tabEl)).catch(err => {
            console.error("Error loading home:", err);
            tabEl.innerHTML = '<p class="text-red-500">Error cargando inicio.</p>';
        });
    } else if (path === '/dashboard/rendimiento') {
        import('./rendimiento.js').then(m => m.renderRendimiento(tabEl));
    } else if (path === '/dashboard/perfil') {
        import('./perfil.js').then(m => m.renderPerfil(tabEl));
    } else {
        tabEl.innerHTML = `<h2 class="text-xl font-bold">404 No Encontrado: ${path}</h2>`;
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
