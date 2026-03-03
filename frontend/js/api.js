const API_URL = 'http://localhost:3000/api';

// --- SISTEMA GLOBAL DE CARGA Y NOTIFICACIONES (Vanilla JS) ---

const showLoading = () => {
    if (document.getElementById('global-spinner')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-spinner';
    // Estilos usando Tailwind como base pero aplicados via JS para limpieza
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm cursor-wait';

    // Spinner minimalista y moderno
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

    // Tailwind classes preaplicadas
    const bgColor = isError ? 'bg-red-500' : 'bg-green-500';
    toast.className = `fixed bottom-5 right-5 text-white px-6 py-3 rounded-lg shadow-2xl z-[9999] transform translate-y-10 opacity-0 transition-all duration-300 font-medium ${bgColor}`;

    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <span>${isError ? '⚠️' : '✅'}</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    // Desmontar el toast después de 3.5s
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

// Procesador Inteligente de Respuestas
const processResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Error procesando solicitud en el servidor');
    }
    return data;
};

// --- INTERFAZ DE EXPORTACIÓN (Wrapper) ---

export const api = {
    get: async (endpoint) => {
        showLoading();
        try {
            const res = await fetch(`${API_URL}${endpoint}`);
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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
            const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
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
