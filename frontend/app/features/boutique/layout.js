/**
 * boutique/layout.js
 * Componente de diseño (Shell) para el módulo de Boutique.
 * Gestiona la barra lateral (sidebar), navegación móvil y carga dinámica de pestañas.
 */
import { navigateTo } from '../core/app.js';
import { renderBoutiqueHome } from './home.js';
import { showChangePasswordModal } from '../shared/modal.js';


// Módulos precargados para navegación instantánea
const moduleCache = {};
const preload = (path) => {
    if (!moduleCache[path]) {
        switch(path) {
            case 'clients':  moduleCache['clients']  = import('./clients.js');  break;
            case 'calendar': moduleCache['calendar'] = import('./calendar.js'); break;
            case 'finance':  moduleCache['finance']  = import('./finance.js');  break;
            case 'gallery':  moduleCache['gallery']  = import('./gallery.js');  break;
        }
    }
};

const getModule = async (name) => {
    if (!moduleCache[name]) preload(name);
    return moduleCache[name];
};

const NAV_ITEMS = [
    { href: '/boutique-welcome',           icon: 'layout-dashboard', label: 'Resumen'  },
    { href: '/boutique-welcome/clientes',  icon: 'users',            label: 'Clientas' },
    { href: '/boutique-welcome/calendario',icon: 'calendar',         label: 'Agenda'   },
    { href: '/boutique-welcome/gastos',    icon: 'dollar-sign',      label: 'Finanzas' },
    { href: '/boutique-welcome/mis-unas',  icon: 'camera',           label: 'Mis Uñas' },
];

const renderSidebar = (activePath) => NAV_ITEMS.map(item => {
    const isActive = activePath === item.href;
    return `
        <a href="${item.href}" data-link
            class="nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-colors
            ${isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}">
            <i data-lucide="${item.icon}" class="w-5 h-5 md:w-6 md:h-6"></i>
            <span class="hidden lg:block font-bold">${item.label}</span>
        </a>`;
}).join('');

let layoutMounted = false;
let tabContainers = {};

/**
 * Renderiza el layout principal de la Boutique.
 * Implementa un sistema de caché de pestañas para evitar re-renders innecesarios.
 */
export const renderBoutiqueLayout = () => {
    const app = document.getElementById('app');
    const path = window.location.hash.slice(1).replace(/\/+$/, '') || '/boutique-welcome';

    // --- Primera vez: montar el shell completo ---
    if (!layoutMounted) {
        app.innerHTML = `
            <div class="flex min-h-screen bg-gray-50">
            <!-- Sidebar (solo visible en md+) -->
            <aside class="hidden md:flex w-20 lg:w-64 bg-slate-900 text-white flex-col fixed h-full transition-all duration-300 z-50">
                <div class="p-4 md:p-6 flex justify-center lg:justify-start items-center gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-emerald-500/50">O</div>
                    <span class="font-black text-xl hidden lg:block tracking-tight text-white">OH-NAILS</span>
                </div>
                <nav id="sidebar-nav" class="flex-1 mt-4 md:mt-6 px-2 md:px-4 space-y-2">
                    ${renderSidebar(path)}
                    <div class="pt-4 mt-4 border-t border-slate-700 space-y-1">
                        <button id="changePwdBtn"
                            class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <i data-lucide="key-round" class="w-5 h-5 md:w-6 md:h-6"></i>
                            <span class="hidden lg:block font-bold">Seguridad</span>
                        </button>
                        <button id="logoutBtn"
                            class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                            <i data-lucide="log-out" class="w-5 h-5 md:w-6 md:h-6"></i>
                            <span class="hidden lg:block font-bold">Salir</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 md:ml-20 lg:ml-64 p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
                <div id="layout-content" class="max-w-7xl mx-auto"></div>
            </main>

            <!-- Bottom Nav (solo visible en móvil) -->
            <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-50 safe-area-bottom">
                <div class="flex items-stretch justify-around h-16">
                    ${NAV_ITEMS.map(item => {
                        const isActive = path === item.href;
                        return `
                        <a href="${item.href}" data-link class="flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${
                            isActive ? 'text-emerald-600' : 'text-gray-400'
                        }">
                            <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                            <span class="text-[10px] font-bold">${item.label}</span>
                            ${isActive ? '<div class="absolute top-0 w-8 h-0.5 bg-emerald-500 rounded-full"></div>' : ''}
                        </a>`;
                    }).join('')}
                    <button id="logoutBtnMobile" class="flex flex-col items-center justify-center flex-1 gap-0.5 text-red-400">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="text-[10px] font-bold">Salir</span>
                    </button>
                </div>
            </nav>
        </div>`;

        lucide.createIcons();

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            layoutMounted = false;
            tabContainers = {};
            navigateTo('/logout-confirmation', { from: 'boutique' });
        });
        document.getElementById('logoutBtnMobile')?.addEventListener('click', () => {
            layoutMounted = false;
            tabContainers = {};
            navigateTo('/logout-confirmation', { from: 'boutique' });
        });
        document.getElementById('changePwdBtn')?.addEventListener('click', () => {
            showChangePasswordModal();
        });

        layoutMounted = true;

        // Precargar todos los módulos silenciosamente para que estén listos
        setTimeout(() => {
            preload('clients');
            preload('calendar');
            preload('finance');
            preload('gallery');
        }, 500);
    } else {
        // Solo actualizar el estado activo del sidebar (sin reconstruir nada más)
        document.getElementById('sidebar-nav').innerHTML = `
            ${renderSidebar(path)}
            <div class="pt-4 mt-4 border-t border-slate-700 space-y-1">
                <button id="changePwdBtn"
                    class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="key-round" class="w-5 h-5 md:w-6 md:h-6"></i>
                    <span class="hidden lg:block font-bold">Seguridad</span>
                </button>
                <button id="logoutBtn"
                    class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                    <i data-lucide="log-out" class="w-5 h-5 md:w-6 md:h-6"></i>
                    <span class="hidden lg:block font-bold">Salir</span>
                </button>
            </div>`;

        // Actualizar bottom nav activo en móvil
        const bottomNav = document.querySelector('nav.md\\:hidden .flex');
        if (bottomNav) {
            bottomNav.querySelectorAll('a[data-link]').forEach(a => {
                const isActive = a.getAttribute('href') === path;
                a.className = `flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`;
            });
        }

        lucide.createIcons();

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            layoutMounted = false;
            tabContainers = {};
            navigateTo('/logout-confirmation', { from: 'boutique' });
        });
        document.getElementById('changePwdBtn')?.addEventListener('click', () => {
            showChangePasswordModal();
        });
    }

    // --- Siempre: cargar el contenido del apartado activo ---
    const contentContainer = document.getElementById('layout-content');

    // Hide all cached tabs
    Object.values(tabContainers).forEach(el => el.classList.add('hidden'));

    if (tabContainers[path]) {
        // Just show the cached tab instantly
        tabContainers[path].classList.remove('hidden');

        if (path === '/boutique-welcome/mis-unas' && window.location.hash.includes('openAdd=true')) {
            const hash = window.location.hash;
            const urlParams = new URLSearchParams(hash.split('?')[1] || '');
            const preselected = urlParams.get('client_id');
            
            window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/boutique-welcome/mis-unas');
            
            const event = new CustomEvent('openAddModal', { detail: { clientId: preselected } });
            tabContainers[path].dispatchEvent(event);
        }
        return;
    }

    // Create a new container for the route
    const tabEl = document.createElement('div');
    tabEl.className = 'w-full animate-in fade-in duration-200';
    tabContainers[path] = tabEl;
    contentContainer.appendChild(tabEl);

    // Skeleton instantáneo mientras carga el módulo
    tabEl.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl w-1/3"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"></div>
                <div class="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"></div>
                <div class="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"></div>
            </div>
            <div class="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"></div>
        </div>`;

    const loadContent = async () => {
        if (path === '/boutique-welcome') {
            renderBoutiqueHome(tabEl);
        } else if (path === '/boutique-welcome/clientes') {
            const m = await getModule('clients');
            m.renderClients(tabEl);
        } else if (path === '/boutique-welcome/calendario') {
            const m = await getModule('calendar');
            m.renderCalendar(tabEl);
        } else if (path === '/boutique-welcome/gastos') {
            const m = await getModule('finance');
            m.renderFinance(tabEl);
        } else if (path === '/boutique-welcome/mis-unas') {
            const m = await getModule('gallery');
            m.renderInstagramGallery(tabEl);
        } else {
            tabEl.innerHTML = `<h2 class="text-2xl font-bold">WIP: ${path}</h2>`;
        }
    };

    loadContent();
};

