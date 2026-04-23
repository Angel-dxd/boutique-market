import { navigateTo } from '../core/app.js';

export const renderLogin = () => {
    const app = document.getElementById('app');

    // We can just set innerHTML since we are building a SPA and this is a root view
    app.innerHTML = `
        <!-- MOBILE: Pantalla completa moderna con header de marca -->
        <div class="min-h-screen flex flex-col md:hidden bg-white">
            <!-- Header de marca móvil -->
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 px-6 pt-16 pb-10 text-white text-center relative overflow-hidden flex-shrink-0">
                <div class="absolute top-0 left-0 w-40 h-40 rounded-full bg-emerald-500 blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div class="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-blue-500 blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
                <div class="relative z-10">
                    <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl shadow-emerald-500/40 mx-auto mb-4">M</div>
                    <h1 class="text-2xl font-black tracking-tight">Marquez Business</h1>
                    <p class="text-gray-400 text-sm mt-1">Sistema de Gestión Familiar</p>
                </div>
            </div>

            <!-- Formulario móvil -->
            <div class="flex-1 flex flex-col justify-center px-6 py-8">
                <h2 class="text-2xl font-black text-gray-800 mb-1">Bienvenida 👋</h2>
                <p class="text-gray-400 text-sm mb-8">Inicia sesión para continuar</p>

                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Usuario</label>
                        <div class="relative">
                            <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"></i>
                            <input type="text" id="username"
                                class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-gray-800 font-medium text-base"
                                placeholder="Ej: arelys" required autocomplete="username" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contraseña</label>
                        <div class="relative">
                            <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"></i>
                            <input type="password" id="password-mobile"
                                class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-gray-800 font-medium text-base"
                                placeholder="••••••" required autocomplete="current-password" />
                        </div>
                    </div>

                    <div id="error-message-mobile" class="hidden text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl text-center font-medium"></div>

                    <button type="submit"
                        class="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-base hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-900/20 mt-2">
                        Entrar al Sistema
                    </button>
                </form>

                <!-- Chips de negocios -->
                <div class="grid grid-cols-2 gap-3 mt-8">
                    <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-center">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-1"></div>
                        <p class="text-xs font-bold text-emerald-700">Oh-Nails</p>
                        <p class="text-[10px] text-emerald-500">Estética</p>
                    </div>
                    <div class="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-center">
                        <div class="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-1"></div>
                        <p class="text-xs font-bold text-blue-700">El Gallo Azul</p>
                        <p class="text-[10px] text-blue-500">Pollería</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- DESKTOP: Layout original de dos columnas -->
        <div class="hidden md:flex min-h-screen bg-gray-100 items-center justify-center p-4">
            <div class="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex h-[600px]">
                <!-- Visual Side -->
                <div class="md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div class="absolute inset-0 opacity-20">
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
                    <form id="loginForm-desktop" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                            <div class="relative">
                                <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20"></i>
                                <input type="text" id="username-desktop"
                                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    placeholder="Ej: arelys" required />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div class="relative">
                                <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20"></i>
                                <input type="password" id="password"
                                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    placeholder="••••••" required />
                            </div>
                        </div>
                        <div id="error-message" class="hidden text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center"></div>
                        <button type="submit"
                            class="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
                            Entrar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();

    const doLogin = (username, password, errorDiv) => {
        const u = username.trim().toLowerCase();
        if (u === 'arelys' && password === '123') {
            localStorage.setItem('currentUser', 'arelys');
            navigateTo('/boutique-welcome');
        } else if (u === 'santi' && password === '123') {
            localStorage.setItem('currentUser', 'santi');
            navigateTo('/market');
        } else {
            errorDiv.textContent = 'Credenciales incorrectas. Comprueba tu usuario y contraseña.';
            errorDiv.classList.remove('hidden');
        }
    };

    // Mobile form
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        doLogin(
            document.getElementById('username').value,
            document.getElementById('password-mobile').value,
            document.getElementById('error-message-mobile')
        );
    });

    // Desktop form
    document.getElementById('loginForm-desktop')?.addEventListener('submit', (e) => {
        e.preventDefault();
        doLogin(
            document.getElementById('username-desktop').value,
            document.getElementById('password').value,
            document.getElementById('error-message')
        );
    });
};
