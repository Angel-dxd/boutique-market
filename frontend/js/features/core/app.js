
/**
 * core/app.js
 * Orquestador principal del frontend.
 * Maneja el enrutamiento (hash routing), la navegación y la inicialización de la app.
 */

import { renderLogin } from '../auth/login.js';
import { renderArielLayout } from '../ariel/layout.js';
import { renderLogoutModal } from '../shared/logoutModal.js';

/**
 * Definición de rutas disponibles y sus respectivos renders.
 */
const routes = {
    '/': {
        render: renderLogin,
        type: 'public'
    },
    '/logout-confirmation': {
        render: () => {
            renderLogoutModal();
        },
        type: 'public'
    },
    '/dashboard': {
        render: renderArielLayout,
        type: 'protected'
    }
};

/**
 * Navega a una URL específica usando Hash Routing.
 * @param {string} url - El destino (ej: #/market).
 * @param {Object} [state={}] - Estado opcional para el historial.
 */
export const navigateTo = (url, state = {}) => {
    window.location.hash = url;
    if (state && Object.keys(state).length > 0) {
        history.replaceState(state, '');
    }
};

/**
 * Enrutador: extrae la ruta del hash y renderiza la vista correspondiente.
 */
const router = async () => {
    // Extrae el path del hash (#/market -> /market)
    const rawPath = window.location.hash.slice(1) || '/';
    const path = rawPath.split('?')[0].replace(/\/+$/, '') || '/';

    let route = routes[path];

    if (!route) {
        // Manejo de sub-rutas dinámicas
        if (path.startsWith('/dashboard')) {
            route = routes['/dashboard'];
        } else {
            // 404: Redirigir al inicio
            navigateTo('/');
            return;
        }
    }

    const getBaseRoute = (p) => {
        if (p.startsWith('/dashboard')) return 'dashboard';
        return p;
    };

    const newBase = getBaseRoute(path);
    const isSubRouteTransition = window.__currentBaseRoute__ && window.__currentBaseRoute__ === newBase;
    window.__currentBaseRoute__ = newBase;

    if (isSubRouteTransition) {
        // Carga la pestaña directamente sin parpadeos ni animaciones de página completa
        route.render();
    } else {
        // Aplicar animación de transición (Turbo Feel) solo cuando cambiamos de layout principal
        const appContainer = document.getElementById('app');
        appContainer.classList.remove('view-transition');
        void appContainer.offsetWidth; 
        appContainer.classList.add('view-transition');

        // Ejecuta el render con suavizado nativo si está disponible
        if (document.startViewTransition) {
            document.startViewTransition(() => route.render());
        } else {
            route.render();
        }
    }

    // --- TURBO PREFETCH ---
    // Si entramos en una sección protegida, cargamos datos de otras secciones en segundo plano
    if (route.type === 'protected') {
        const { api } = await import('./api.js');
        // Cargamos Dashboard e Inventario por adelantado (sin esperar)
        api.get('/dashboard/stats').catch(() => {});
        api.get('/products').catch(() => {});
        api.get('/providers').catch(() => {});
    }
};

// Handle Browser History (hashchange instead of popstate)
window.addEventListener('hashchange', router);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Intercept clicks on links with data-link attribute
    document.body.addEventListener('click', e => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault();
            navigateTo(link.getAttribute('href'));
        }
    });

    router();
});
