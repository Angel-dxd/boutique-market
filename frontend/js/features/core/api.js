// Usa variable inyectada si existe, o asume que el backend corre en el mismo host que el frontend pero en el puerto 3000.
const API_URL = window.REACT_APP_API_URL || `http://${window.location.hostname}:3000/api`;

// --- SISTEMA GLOBAL DE CARGA Y NOTIFICACIONES (Vanilla JS) ---

// Spinner global desactivado — cada módulo gestiona su propio estado de carga
// para no bloquear la navegación entre apartados
const showLoading = () => {};
const hideLoading = () => {};

const normalizeApiErrorMessage = (rawMessage) => {
    if (!rawMessage) return 'Ha ocurrido un error inesperado.';

    if (typeof rawMessage === 'string') {
        const trimmed = rawMessage.trim();

        // Intentar deserializar 1-2 veces para casos JSON escapado dentro de string.
        let parsedValue = trimmed;
        for (let i = 0; i < 2; i += 1) {
            if (!(typeof parsedValue === 'string')) break;
            const candidate = parsedValue.trim();
            if (!(candidate.startsWith('[') || candidate.startsWith('{') || candidate.startsWith('"[') || candidate.startsWith('"{'))) break;
            try {
                parsedValue = JSON.parse(candidate);
            } catch (_) {
                break;
            }
        }

        if (Array.isArray(parsedValue)) {
            const messages = parsedValue
                .map((issue) => issue?.message)
                .filter(Boolean);
            if (messages.length > 0) return messages.join(' ');
        }

        if (parsedValue && typeof parsedValue === 'object' && parsedValue.message) {
            return parsedValue.message;
        }

        // Mensaje típico de zod con formato "campo: mensaje"
        if (trimmed.includes(':') && trimmed.length < 180) {
            return trimmed.split(':').slice(1).join(':').trim() || trimmed;
        }

        const messageMatches = [...trimmed.matchAll(/"message"\s*:\s*"([^"]+)"/g)];
        if (messageMatches.length > 0) {
            return messageMatches.map((m) => m[1]).join(' ');
        }

        return trimmed;
    }

    return 'Ha ocurrido un error inesperado.';
};

const showToast = (message, isError = false) => {
    const toast = document.createElement('div');

    const safeMessage = normalizeApiErrorMessage(message);
    const bgColor = isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800';
    const iconColor = isError ? 'text-red-600 bg-red-100' : 'text-emerald-600 bg-emerald-100';
    const svgIcon = isError 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.className = `fixed bottom-6 right-6 border ${bgColor} px-4 py-3 rounded-2xl shadow-xl shadow-black/10 z-[9999] transform translate-y-12 opacity-0 transition-all duration-300 ease-out flex items-start gap-3 max-w-md w-[calc(100%-2rem)] sm:w-[420px]`;

    const iconWrapper = document.createElement('div');
    iconWrapper.className = `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`;
    iconWrapper.innerHTML = svgIcon;

    const text = document.createElement('p');
    text.className = 'text-sm leading-snug font-semibold pr-1 break-words';
    text.textContent = safeMessage;

    toast.appendChild(iconWrapper);
    toast.appendChild(text);

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-12', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-12', 'opacity-0');
        setTimeout(() => toast.remove(), 400);
    }, isError ? 5000 : 3200);
};

const processResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        let errorMsg = data.error || 'Error procesando solicitud en el servidor';
        if (data.errors && data.errors.length > 0) {
            errorMsg = data.errors[0];
        }
        const error = new Error(normalizeApiErrorMessage(errorMsg));
        error.status = res.status;
        throw error;
    }
    return data;
};

// Generador Dinámico de Cabeceras (Multitenant)
const getHeaders = (extraHeaders = {}) => {
    const currentUser = localStorage.getItem('currentUser') || 'market';
    const tenantId = currentUser === 'santi' ? 'santi' : 'market';
    const token = localStorage.getItem('authToken');
    return {
        'x-tenant-id': tenantId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
            if (e.status === 401) {
                localStorage.removeItem('authToken');
                window.location.hash = '/';
            }
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
            if (e.status === 401) {
                localStorage.removeItem('authToken');
                window.location.hash = '/';
            }
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
            if (e.status === 401) {
                localStorage.removeItem('authToken');
                window.location.hash = '/';
            }
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
            if (e.status === 401) {
                localStorage.removeItem('authToken');
                window.location.hash = '/';
            }
            showToast(e.message, true);
            console.error('API Error:', e);
            return { error: e.message };
        }
    }
};
