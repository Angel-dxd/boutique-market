// frontend/js/features/shared/logoutModal.js
import { navigateTo } from '../core/app.js';

export const renderLogoutModal = (from) => {
    const app = document.getElementById('app');

    // Determinamos el estilo y nombre basado en el tenant
    const isBoutique = from === 'boutique';
    const color = isBoutique ? 'bg-emerald-600' : 'bg-orange-500';
    const name = isBoutique ? 'Oh-Nails' : 'El Gallo Azul';

    // Limpiamos el contenedor
    app.innerHTML = '';

    // 1. Contenedor principal
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-gray-100 flex items-center justify-center p-4';

    // 2. Tarjeta del modal
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-in zoom-in duration-200';

    // 3. Icono
    const iconContainer = document.createElement('div');
    iconContainer.className = `w-16 h-16 rounded-full ${color} text-white flex items-center justify-center mx-auto mb-6 shadow-lg`;
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'log-out');
    icon.setAttribute('width', '32');
    iconContainer.appendChild(icon);

    // 4. Título
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-gray-800 mb-2';
    title.textContent = '¿Cerrar Sesión?';

    // 5. Texto descriptivo (AQUÍ ESTÁ LA SEGURIDAD XSS)
    const desc = document.createElement('p');
    desc.className = 'text-gray-500 text-sm mb-8';
    desc.textContent = 'Estás saliendo de ';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'font-bold';
    nameSpan.textContent = name; // textContent escapa automáticamente cualquier código malicioso
    desc.appendChild(nameSpan);
    desc.appendChild(document.createTextNode('.'));

    // 6. Contenedor de Botones
    const btnContainer = document.createElement('div');
    btnContainer.className = 'space-y-3';

    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirmLogout';
    confirmBtn.className = `w-full ${color} hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all shadow-md`;
    confirmBtn.textContent = 'Confirmar Salida';

    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelLogout';
    cancelBtn.className = 'w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50';
    cancelBtn.textContent = 'Cancelar';

    // Ensamblaje del DOM
    btnContainer.appendChild(confirmBtn);
    btnContainer.appendChild(cancelBtn);

    card.appendChild(iconContainer);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(btnContainer);

    container.appendChild(card);
    app.appendChild(container);

    // Renderizar iconos de Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Event listeners
    document.getElementById('confirmLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        navigateTo('/');
    });

    document.getElementById('cancelLogout').addEventListener('click', () => {
        if (isBoutique) {
            navigateTo('/boutique-welcome');
        } else {
            navigateTo('/market');
        }
    });
};