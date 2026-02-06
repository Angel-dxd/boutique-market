
import { renderLogin } from './login.js';
import { renderMarketLayout } from './layouts/marketLayout.js';
import { renderBoutiqueLayout } from './layouts/boutiqueLayout.js';
import { renderLogoutModal } from './features/shared/logoutModal.js';

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
    history.pushState(state, null, url);
    router();
};

// Router
const router = async () => {
    const path = window.location.pathname;

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

// Handle Browser History
window.addEventListener('popstate', router);

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
