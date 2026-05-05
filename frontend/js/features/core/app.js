
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
            // Determina el origen desde el estado del historial
            const from = history.state?.from || 'boutique';
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

    // Ejecuta el render de la ruta encontrada
    route.render();
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
