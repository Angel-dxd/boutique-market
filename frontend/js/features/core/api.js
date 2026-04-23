// Usa variable inyectada si existe, o asume que el backend corre en el mismo host que el frontend pero en el puerto 3000.
const API_URL = window.REACT_APP_API_URL || `http://${window.location.hostname}:3000/api`;

// --- SISTEMA GLOBAL DE CARGA Y NOTIFICACIONES (Vanilla JS) ---

const showLoading = () => {
    if (document.getElementById('global-spinner')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-spinner';
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm cursor-wait';

    const spinner = document.createElement('div');
    spinner.className = 'w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin';

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
};

const hideLoading = () => {
    const overlay = document.getElementById('global-spinner');
    if (overlay) overlay.remove();
};

const showToast = (message, isError = false) => {
    const toast = document.createElement('div');

    const bgColor = isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800';
    const iconColor = isError ? 'text-red-500 bg-red-100' : 'text-emerald-500 bg-emerald-100';
    const svgIcon = isError 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.className = `fixed bottom-6 right-6 border ${bgColor} px-4 py-3 rounded-2xl shadow-xl shadow-black/5 z-[9999] transform translate-y-12 opacity-0 transition-all duration-400 ease-out font-bold flex items-center gap-3 max-w-sm w-[calc(100%-3rem)] sm:w-max`;

    toast.innerHTML = `
        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColor}">${svgIcon}</div>
        <p class="text-sm leading-tight flex-1">${message}</p>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-12', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-12', 'opacity-0');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
};

const processResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        let errorMsg = data.error || 'Error procesando solicitud en el servidor';
        if (data.errors && data.errors.length > 0) {
            errorMsg = data.errors[0];
        }
        throw new Error(errorMsg);
    }
    return data;
};

// Generador Dinámico de Cabeceras (Multitenant)
const getHeaders = (extraHeaders = {}) => {
    const currentUser = localStorage.getItem('currentUser') || 'market';
    const tenantId = currentUser === 'santi' ? 'santi' : 'market';
    return {
        'x-tenant-id': tenantId,
        ...extraHeaders
    };
};

// --- INTERFAZ DE EXPORTACIÓN (Wrapper) ---

export const api = {
    showLoading,
    hideLoading,
    showToast,
    get: async (endpoint) => {
        showLoading();
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: getHeaders()
            });
            const data = await processResponse(res);
            hideLoading();
            return data;
        } catch (e) {
            hideLoading();
            showToast(e.message, true);
            console.error('API Error:', e);
            return { error: e.message };
        }
    },
    post: async (endpoint, payloadData) => {
        showLoading();
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(payloadData)
            });
            const data = await processResponse(res);
            hideLoading();

            showToast('Operación completada con éxito.');
            return data;
        } catch (e) {
            hideLoading();
            showToast(e.message, true);
            console.error('API Error:', e);
            return { error: e.message };
        }
    },
    put: async (endpoint, payloadData) => {
        showLoading();
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(payloadData)
            });
            const data = await processResponse(res);
            hideLoading();

            showToast('Los cambios se han guardado.');
            return data;
        } catch (e) {
            hideLoading();
            showToast(e.message, true);
            console.error('API Error:', e);
            return { error: e.message };
        }
    },
    delete: async (endpoint) => {
        showLoading();
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await processResponse(res);
            hideLoading();

            showToast('Registro eliminado exitosamente.');
            return data;
        } catch (e) {
            hideLoading();
            showToast(e.message, true);
            console.error('API Error:', e);
            return { error: e.message };
        }
    }
};
