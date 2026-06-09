/**
 * auth/login.js
 * Módulo de autenticación centralizado.
 * Gestiona el acceso de usuarios (Arelys para Boutique, Santi para Market).
 */
import { navigateTo } from '../core/app.js';
import { api } from '../core/api.js';

// ─── URL base (mismo origen que api.js) ──────────────────────────────────────
const _BACKEND_ROOT = window.__API_URL__
    ? window.__API_URL__.replace(/\/api$/, '')
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://boutique-market-api.onrender.com');

/**
 * Warm-up ping: lanza una petición ligera al backend en cuanto carga la pantalla
 * de login para despertar el servidor de Render (free tier se duerme tras ~15min
 * de inactividad y tarda 30-60s en arrancar).
 *
 * Si el servidor tarda más de 3 segundos, muestra un aviso sutil al usuario.
 * Fire-and-forget: no bloquea el renderizado del formulario.
 */
const warmupBackend = () => {
    const SLOW_THRESHOLD_MS = 3000;
    const startTime = Date.now();
    let bannerShown = false;

    // Timer para mostrar el aviso si el servidor está dormido
    const slowTimer = setTimeout(() => {
        bannerShown = true;
        const existing = document.getElementById('server-warmup-banner');
        if (existing) return;
        const banner = document.createElement('div');
        banner.id = 'server-warmup-banner';
        banner.className = 'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium text-amber-800 bg-amber-50 border-b border-amber-200';
        banner.innerHTML = `
            <svg class="animate-spin w-3.5 h-3.5 text-amber-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span>Conectando con el servidor... (primer arranque puede tardar hasta 60 seg)</span>`;
        document.body.prepend(banner);
    }, SLOW_THRESHOLD_MS);

    fetch(`${_BACKEND_ROOT}/`, { method: 'GET', cache: 'no-store' })
        .then(() => {
            clearTimeout(slowTimer);
            if (bannerShown) {
                const banner = document.getElementById('server-warmup-banner');
                if (banner) {
                    banner.innerHTML = `<span>✓ Servidor listo (${((Date.now() - startTime) / 1000).toFixed(1)}s)</span>`;
                    banner.className = 'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-medium text-emerald-800 bg-emerald-50 border-b border-emerald-200 transition-opacity';
                    setTimeout(() => { banner.style.opacity = '0'; setTimeout(() => banner.remove(), 400); }, 1500);
                }
            }
        })
        .catch(() => clearTimeout(slowTimer)); // Silencioso si falla (CORS, offline, etc.)
};

/**
 * Renderiza la pantalla de inicio de sesión con diseño adaptativo.
 */
export const renderLogin = () => {
    const app = document.getElementById('app');

    // Despertar el backend inmediatamente — sin bloquear el render del formulario
    warmupBackend();

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
                                class="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-gray-800 font-medium text-base"
                                placeholder="••••••" required autocomplete="current-password" />
                            <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors toggle-password" data-target="password-mobile">
                                <i data-lucide="eye" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>

                    <div id="error-message-mobile" class="hidden text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl text-center font-medium"></div>

                    <button type="submit"
                        class="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-base hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-900/20 mt-2">
                        Entrar al Sistema
                    </button>
                    <button type="button" id="bypassBtn-mobile"
                        class="w-full bg-transparent text-gray-500 hover:text-emerald-600 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all mt-1">
                        Saltar Entrada (Modo Demo)
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
                                    class="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    placeholder="••••••" required />
                                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors toggle-password" data-target="password">
                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                        <div id="error-message" class="hidden text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center"></div>
                        <button type="submit"
                            class="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
                            Entrar al Sistema
                        </button>
                        <button type="button" id="bypassBtn-desktop"
                            class="w-full bg-transparent text-gray-500 hover:text-gray-900 py-3 rounded-xl font-bold text-sm transition-colors mt-2">
                            Saltar Entrada (Modo Demo)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();

    // Toggle password visibility logic
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons(); // Re-render icon
        });
    });

    const doLogin = async (username, password, errorDiv, submitBtn) => {
        let u = username.trim().toLowerCase();
        if (u === 'areli') {
            u = 'arelys';
        }
        const originalBtnText = submitBtn.innerHTML;
        
        // 1. Feedback visual inmediato (Turbo feel)
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-5 h-5 mx-auto"></i>';
        submitBtn.disabled = true;
        lucide.createIcons();
        
        // 2. Configuramos temporalmente el tenant basado en el usuario
        if (u === 'santi') {
            localStorage.setItem('currentUser', 'santi');
        } else {
            localStorage.setItem('currentUser', 'arelys');
        }

        errorDiv.classList.add('hidden');

        // Timer para mostrar el overlay premium de despertar servidor si tarda más de 1.5 segundos
        let loadingOverlay = null;
        const slowTimer = setTimeout(() => {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-[999] text-white p-6 animate-in fade-in duration-300';
            loadingOverlay.innerHTML = `
                <div class="bg-gray-950/80 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-emerald-500 blur-3xl opacity-20 -translate-y-1/2 pointer-events-none"></div>
                    
                    <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <i data-lucide="zap" class="w-8 h-8"></i>
                    </div>
                    
                    <div class="space-y-2">
                        <h3 class="text-xl font-black tracking-tight">⚡ Despertando Servidor...</h3>
                        <p class="text-xs text-gray-400 leading-relaxed">El servidor gratuito de Render se suspende tras inactividad. Esto tomará entre 30 y 60 segundos solo para la primera entrada del día.</p>
                    </div>

                    <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden relative">
                        <div class="bg-emerald-400 absolute inset-y-0 left-0 rounded-full animate-infinite-loading w-1/3"></div>
                    </div>

                    <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Estableciendo conexión segura con la base de datos</div>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
            lucide.createIcons({ root: loadingOverlay });

            if (!document.getElementById('infinite-loading-style')) {
                const style = document.createElement('style');
                style.id = 'infinite-loading-style';
                style.textContent = `
                    @keyframes infinite-loading {
                        0% { left: -30%; width: 30%; }
                        50% { width: 40%; }
                        100% { left: 110%; width: 30%; }
                    }
                    .animate-infinite-loading {
                        animation: infinite-loading 1.8s infinite linear;
                    }
                `;
                document.head.appendChild(style);
            }
        }, 1.5 * 1000);

        try {
            const res = await api.post('/auth/login', { username: u, password });

            clearTimeout(slowTimer);
            if (loadingOverlay) {
                loadingOverlay.remove();
            }

            if (res && res.success) {
                localStorage.setItem('authToken', res.token);
                
                if (res.user.tenant === 'santi') {
                    navigateTo('/market');
                } else {
                    navigateTo('/boutique-welcome');
                }
            } else {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
                const errorMsg = res.error || 'Credenciales incorrectas.';
                errorDiv.innerHTML = `<div>${errorMsg}</div>`;
                
                // Si es un error del servidor, de conexión o base de datos offline, mostramos el botón de bypass de emergencia
                if (errorMsg.includes('servidor') || errorMsg.includes('fetch') || errorMsg.includes('conn') || errorMsg.includes('error')) {
                    const demoBtn = document.createElement('button');
                    demoBtn.type = 'button';
                    demoBtn.className = 'mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline block w-full text-center cursor-pointer';
                    demoBtn.textContent = 'Entrar en modo demostración (sin conexión)';
                    demoBtn.addEventListener('click', () => triggerBypass(username));
                    errorDiv.appendChild(demoBtn);
                }
                
                errorDiv.classList.remove('hidden');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                lucide.createIcons();
            }
        } catch (err) {
            clearTimeout(slowTimer);
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            
            errorDiv.innerHTML = `<div>Fallo al conectar con el servidor.</div>`;
            const demoBtn = document.createElement('button');
            demoBtn.type = 'button';
            demoBtn.className = 'mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline block w-full text-center cursor-pointer';
            demoBtn.textContent = 'Entrar en modo demostración (sin conexión)';
            demoBtn.addEventListener('click', () => triggerBypass(username));
            errorDiv.appendChild(demoBtn);
            
            errorDiv.classList.remove('hidden');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            lucide.createIcons();
        }
    };

    const triggerBypass = (username) => {
        let u = (username || '').trim().toLowerCase();
        if (u === 'areli') {
            u = 'arelys';
        }
        
        // Configurar tenant
        if (u === 'santi') {
            localStorage.setItem('currentUser', 'santi');
            localStorage.setItem('authToken', 'bypass-token-santi');
            api.showToast('Accediendo en Modo Demo (El Gallo Azul)', false);
            navigateTo('/market');
        } else {
            localStorage.setItem('currentUser', 'arelys');
            localStorage.setItem('authToken', 'bypass-token-arelys');
            api.showToast('Accediendo en Modo Demo (Oh-Nails)', false);
            navigateTo('/boutique-welcome');
        }
    };

    // Mobile bypass
    document.getElementById('bypassBtn-mobile')?.addEventListener('click', () => {
        triggerBypass(document.getElementById('username').value);
    });

    // Desktop bypass
    document.getElementById('bypassBtn-desktop')?.addEventListener('click', () => {
        triggerBypass(document.getElementById('username-desktop').value);
    });

    // Mobile form
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        doLogin(
            document.getElementById('username').value,
            document.getElementById('password-mobile').value,
            document.getElementById('error-message-mobile'),
            e.target.querySelector('button[type="submit"]')
        );
    });

    // Desktop form
    document.getElementById('loginForm-desktop')?.addEventListener('submit', (e) => {
        e.preventDefault();
        doLogin(
            document.getElementById('username-desktop').value,
            document.getElementById('password').value,
            document.getElementById('error-message'),
            e.target.querySelector('button[type="submit"]')
        );
    });
};
