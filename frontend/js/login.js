import { navigateTo } from './app.js';

export const renderLogin = () => {
    const app = document.getElementById('app');

    // We can just set innerHTML since we are building a SPA and this is a root view
    app.innerHTML = `
        <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row h-[600px]">

                <!-- Visual Side -->
                <div class="md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div class="absolute inset-0 opacity-20">
                        <!-- Abstract Patterns -->
                        <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-emerald-500 blur-3xl"></div>
                        <div class="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-blue-500 blur-3xl"></div>
                    </div>

                    <div class="relative z-10">
                        <h1 class="text-4xl font-bold mb-2">Bienvenido</h1>
                        <p class="text-gray-400">Sistema de Gestión Integral</p>
                    </div>

                    <div class="relative z-10 space-y-6">
                        <div class="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-3 h-3 rounded-full bg-[#059669]"></div>
                                <span class="font-bold">Oh-Nails</span>
                            </div>
                            <p class="text-xs text-gray-400">Gestión de Estética</p>
                        </div>
                        <div class="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-3 h-3 rounded-full bg-[#0077b6]"></div>
                                <span class="font-bold">El Gallo Azul</span>
                            </div>
                            <p class="text-xs text-gray-400">Gestión de Pollería</p>
                        </div>
                    </div>

                    <p class="text-xs text-gray-500 relative z-10">© 2026 Marquez Family Business</p>
                </div>

                <!-- Login Form Side -->
                <div class="md:w-1/2 p-12 flex flex-col justify-center">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>

                    <form id="loginForm" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                            <div class="relative">
                                <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20"></i>
                                <input
                                    type="text"
                                    id="username"
                                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    placeholder="Ej: arelys"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div class="relative">
                                <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20"></i>
                                <input
                                    type="password"
                                    id="password"
                                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    placeholder="••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div id="error-message" class="hidden text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center"></div>

                        <button
                            type="submit"
                            class="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
                        >
                            Entrar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Re-initialize icons since we just injected HTML
    lucide.createIcons();

    // Attach Event Listeners
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');

        // Logic
        if (username === 'arelys' && password === '123') {
            navigateTo('/boutique-welcome');
        } else if (username === 'santi' && password === '123') {
            navigateTo('/market');
        } else {
            errorDiv.textContent = 'Credenciales incorrectas. Intenta con arelys/123 o santi/123';
            errorDiv.classList.remove('hidden');
        }
    });
};
