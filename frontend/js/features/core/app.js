
/**
 * core/app.js
 * Orquestador principal del frontend.
 * Maneja el enrutamiento (hash routing), la navegación y la inicialización de la app.
 */

import { renderLogin } from '../auth/login.js';
import { renderMarketLayout } from '../market/layout.js';
import { renderBoutiqueLayout } from '../boutique/layout.js';
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
            // Determina el origen desde el estado del historial con fallback en currentUser de localStorage
            const currentUser = localStorage.getItem('currentUser') || 'arelys';
            const defaultFrom = currentUser === 'santi' ? 'market' : 'boutique';
            const from = history.state?.from || defaultFrom;
            renderLogoutModal(from);
        },
        type: 'public'
    },
    '/market': {
        render: renderMarketLayout,
        type: 'protected'
    },
    '/boutique-welcome': {
        render: renderBoutiqueLayout,
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
        if (path.startsWith('/market')) {
            route = routes['/market'];
        } else if (path.startsWith('/boutique-welcome')) {
            route = routes['/boutique-welcome'];
        } else {
            // 404: Redirigir al inicio
            navigateTo('/');
            return;
        }
    }

    const getBaseRoute = (p) => {
        if (p.startsWith('/market')) return 'market';
        if (p.startsWith('/boutique-welcome')) return 'boutique';
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
        api.get('/gallery?limit=12').catch(() => {}); // Pre-carga de uñas (Turbo)
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
