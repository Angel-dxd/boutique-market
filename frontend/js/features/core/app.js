
import { renderLogin } from '../auth/login.js';
import { renderMarketLayout } from '../market/layout.js';
import { renderBoutiqueLayout } from '../boutique/layout.js';
import { renderLogoutModal } from '../shared/logoutModal.js';

// Route Definitions
const routes = {
    '/': {
        render: renderLogin,
        type: 'public'
    },
    '/logout-confirmation': {
        render: () => {
            // Determine source from history state if possible, or defaulting
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

// Navigate to a URL
export const navigateTo = (url, state = {}) => {
    // Use Hash Routing to prevent 404s on static servers without rewrite rules
    if (url.startsWith('#')) {
        window.location.hash = url;
    } else {
        window.location.hash = url;
    }
};

// Router
const router = async () => {
    // Extract path from hash (e.g. #/market -> /market)
    const rawPath = window.location.hash.slice(1) || '/';
    // Remove query params if any, and trailing slashes
    const path = rawPath.split('?')[0].replace(/\/+$/, '') || '/';

    // Simple matching (start with basic paths)
    // For now we just check exact match or partial start for layouts
    let route = routes[path];

    if (!route) {
        // Handle sub-routes
        if (path.startsWith('/market')) {
            route = routes['/market'];
        } else if (path.startsWith('/boutique-welcome')) {
            route = routes['/boutique-welcome'];
        } else {
            // 404 - Redirect to home for now
            navigateTo('/');
            return;
        }
    }

    // Render the view
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
