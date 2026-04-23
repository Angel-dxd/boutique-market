import { navigateTo } from '../core/app.js';
import { renderBoutiqueHome } from './home.js';

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

export const renderBoutiqueLayout = () => {
    const app = document.getElementById('app');
    const path = window.location.hash.slice(1).replace(/\/+$/, '') || '/boutique-welcome';

    // --- Primera vez: montar el shell completo ---
    if (!layoutMounted) {
        app.innerHTML = `
            <div class="flex min-h-screen bg-gray-50">
                <aside class="w-16 md:w-20 lg:w-64 bg-slate-900 text-white flex flex-col fixed h-full transition-all duration-300 z-50">
                    <div class="p-4 md:p-6 flex justify-center lg:justify-start items-center gap-3">
                        <div class="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-emerald-500/50">O</div>
                        <span class="font-black text-xl hidden lg:block tracking-tight text-white">OH-NAILS</span>
                    </div>
                    <nav id="sidebar-nav" class="flex-1 mt-4 md:mt-6 px-2 md:px-4 space-y-2">
                        ${renderSidebar(path)}
                        <div class="pt-4 mt-4 border-t border-slate-700">
                            <button id="logoutBtn"
                                class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                                <i data-lucide="log-out" class="w-5 h-5 md:w-6 md:h-6"></i>
                                <span class="hidden lg:block font-bold">Salir</span>
                            </button>
                        </div>
                    </nav>
                </aside>
                <main class="flex-1 ml-16 md:ml-20 lg:ml-64 p-4 md:p-8 overflow-x-hidden">
                    <div id="layout-content" class="max-w-7xl mx-auto"></div>
                </main>
            </div>`;

        lucide.createIcons();

        document.getElementById('logoutBtn').addEventListener('click', () => {
            layoutMounted = false;
            navigateTo('/logout-confirmation', { from: 'boutique' });
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
            <div class="pt-4 mt-4 border-t border-slate-700">
                <button id="logoutBtn"
                    class="w-full nav-item flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors">
                    <i data-lucide="log-out" class="w-5 h-5 md:w-6 md:h-6"></i>
                    <span class="hidden lg:block font-bold">Salir</span>
                </button>
            </div>`;
        lucide.createIcons();
        document.getElementById('logoutBtn').addEventListener('click', () => {
            layoutMounted = false;
            navigateTo('/logout-confirmation', { from: 'boutique' });
        });
    }

    // --- Siempre: cargar el contenido del apartado activo ---
    const contentContainer = document.getElementById('layout-content');

    // Skeleton instantáneo mientras carga el módulo
    contentContainer.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-10 bg-gray-200 rounded-2xl w-1/3"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="h-28 bg-gray-100 rounded-2xl"></div>
                <div class="h-28 bg-gray-100 rounded-2xl"></div>
                <div class="h-28 bg-gray-100 rounded-2xl"></div>
            </div>
            <div class="h-64 bg-gray-100 rounded-2xl"></div>
        </div>`;

    const loadContent = async () => {
        if (path === '/boutique-welcome') {
            renderBoutiqueHome(contentContainer);
        } else if (path === '/boutique-welcome/clientes') {
            const m = await getModule('clients');
            m.renderClients(contentContainer);
        } else if (path === '/boutique-welcome/calendario') {
            const m = await getModule('calendar');
            m.renderCalendar(contentContainer);
        } else if (path === '/boutique-welcome/gastos') {
            const m = await getModule('finance');
            m.renderFinance(contentContainer);
        } else if (path === '/boutique-welcome/mis-unas') {
            const m = await getModule('gallery');
            m.renderInstagramGallery(contentContainer);
        } else {
            contentContainer.innerHTML = `<h2 class="text-2xl font-bold">WIP: ${path}</h2>`;
        }
    };

    loadContent();
};

