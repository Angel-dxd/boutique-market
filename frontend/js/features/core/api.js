/**
 * core/api.js
 * Wrapper para la comunicación con la API del backend.
 * Gestiona cabeceras multitenant, autenticación, notificaciones (toasts) y errores.
 */

// URL base de la API. Prioridad: Inyección manual > Variable de entorno > Localhost (Desarrollo) > Render (Producción).
const API_URL = window.__API_URL__ 
    || window.REACT_APP_API_URL 
    || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://boutique-market.onrender.com/api');

// --- SISTEMA DE CACHÉ Y CARGA ---
const cache = new Map();
const CACHE_TTL = 30000; // 30 segundos de vida para los datos

const showLoading = () => {
    let bar = document.getElementById('global-loader');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'global-loader';
        bar.className = 'fixed top-0 left-0 h-[3px] bg-emerald-500 z-[10000] transition-all duration-300 ease-out';
        bar.style.width = '0%';
        document.body.appendChild(bar);
    }
    bar.style.opacity = '1';
    bar.style.width = '30%';
    setTimeout(() => { if (bar) bar.style.width = '70%'; }, 200);
};

const hideLoading = () => {
    const bar = document.getElementById('global-loader');
    if (bar) {
        bar.style.width = '100%';
        setTimeout(() => {
            bar.style.opacity = '0';
            setTimeout(() => { bar.style.width = '0%'; }, 300);
        }, 200);
    }
};

const clearCache = () => cache.clear();

/**
 * Normaliza los mensajes de error de la API (incluyendo errores de validación de Zod).
 * @param {string|Object|Array} rawMessage - El mensaje bruto recibido.
 * @returns {string} Mensaje legible.
 */
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

/**
 * Muestra una notificación visual (toast) en la parte inferior derecha.
 * @param {string} message - El mensaje a mostrar.
 * @param {boolean} [isError=false] - Si es una alerta de error.
 */
const showToast = (message, isError = false) => {
    const toast = document.createElement('div');

    const safeMessage = normalizeApiErrorMessage(message);
    const bgColor = isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-[#1e293b] border-gray-800 text-white';
    const iconColor = isError ? 'text-red-600 bg-red-100' : 'text-emerald-400 bg-transparent';
    const svgIcon = isError 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    // Diseño elegante: píldora pequeña en móvil (centrada arriba del menú), normal en desktop
    toast.className = `fixed z-[9999] border ${bgColor} px-3 py-2 sm:px-4 sm:py-3 rounded-full sm:rounded-2xl shadow-xl transition-all duration-300 ease-out flex items-center gap-2 sm:gap-3 ` +
                      `bottom-20 left-1/2 -translate-x-1/2 w-max max-w-[90vw] translate-y-8 opacity-0 ` +
                      `sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 sm:w-auto sm:min-w-[300px]`;

    const iconWrapper = document.createElement('div');
    iconWrapper.className = `flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${iconColor}`;
    iconWrapper.innerHTML = svgIcon;

    const text = document.createElement('p');
    text.className = 'text-xs sm:text-sm leading-snug font-medium pr-1 break-words';
    text.textContent = safeMessage;

    toast.appendChild(iconWrapper);
    toast.appendChild(text);

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-8', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-8', 'opacity-0');
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
/**
 * Genera dinámicamente las cabeceras HTTP, incluyendo el Tenant ID y el Token de sesión.
 * @param {Object} [extraHeaders={}] - Cabeceras adicionales (ej: Content-Type).
 * @returns {Object} Cabeceras completas.
 */
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
        // Consultar caché primero
        const cached = cache.get(endpoint);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }

        showLoading();
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: getHeaders()
            });
            const data = await processResponse(res);
            
            // Guardar en caché
            cache.set(endpoint, { data, timestamp: Date.now() });
            
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
        clearCache(); // Limpiar caché al escribir
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
        clearCache(); // Limpiar caché al escribir
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
        clearCache(); // Limpiar caché al escribir
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
