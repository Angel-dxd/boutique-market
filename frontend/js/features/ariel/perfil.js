import { api } from '../core/api.js';
import { showChangePasswordModal } from '../shared/modal.js';

export const renderPerfil = async (container) => {
    container.innerHTML = `
        <div class="p-4 md:p-8 w-full max-w-4xl mx-auto space-y-6 md:space-y-8">
            <header class="flex justify-between items-end">
                <div>
                    <h1 class="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Mi Perfil</h1>
                    <p class="text-gray-500 font-medium text-sm md:text-base">Información personal y configuración</p>
                </div>
                <button id="btnChangePwd" class="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-2">
                    <i data-lucide="key-round" class="w-4 h-4"></i> Cambiar contraseña
                </button>
            </header>

            <form id="profileForm" class="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                
                <!-- Datos Personales -->
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Datos Personales</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                            <input type="text" id="full_name" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha de Nacimiento</label>
                            <input type="date" id="birth_date" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sexo</label>
                            <select id="gender" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="">Seleccionar...</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Dirección -->
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Dirección</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Calle</label>
                            <input type="text" id="address_street" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Número</label>
                            <input type="text" id="address_number" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ciudad</label>
                            <input type="text" id="address_city" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Provincia/Estado</label>
                            <input type="text" id="address_state" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">País</label>
                            <input type="text" id="address_country" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                    </div>
                </div>

                <!-- Perfil Profesional -->
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Perfil Profesional e Idioma</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profesión</label>
                            <input type="text" id="profession" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ámbito Profesional</label>
                            <input type="text" id="professional_scope" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Idioma de la interfaz</label>
                            <select id="language" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="es">🇪🇸 Español</option>
                                <option value="pt-BR">🇧🇷 Portugués Brasileño</option>
                                <option value="en">🇬🇧 Inglés</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="pt-4 flex justify-end">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                        <i data-lucide="save" class="w-5 h-5"></i> Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    `;
    lucide.createIcons();

    // Load data
    const loadProfile = async () => {
        const response = await api.get('/profile');
        if (!response.error) {
            const data = response.data || response;
            document.getElementById('full_name').value = data.full_name || '';
            document.getElementById('birth_date').value = data.birth_date ? data.birth_date.split('T')[0] : '';
            document.getElementById('gender').value = data.gender || '';
            document.getElementById('address_street').value = data.address_street || '';
            document.getElementById('address_number').value = data.address_number || '';
            document.getElementById('address_city').value = data.address_city || '';
            document.getElementById('address_state').value = data.address_state || '';
            document.getElementById('address_country').value = data.address_country || '';
            document.getElementById('profession').value = data.profession || '';
            document.getElementById('professional_scope').value = data.professional_scope || '';
            document.getElementById('language').value = data.language || 'es';
        }
    };

    loadProfile();

    // Handle form submit
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            full_name: document.getElementById('full_name').value,
            birth_date: document.getElementById('birth_date').value,
            gender: document.getElementById('gender').value,
            address_street: document.getElementById('address_street').value,
            address_number: document.getElementById('address_number').value,
            address_city: document.getElementById('address_city').value,
            address_state: document.getElementById('address_state').value,
            address_country: document.getElementById('address_country').value,
            profession: document.getElementById('profession').value,
            professional_scope: document.getElementById('professional_scope').value,
            language: document.getElementById('language').value
        };

        const res = await api.put('/profile', payload);
        if (!res.error) {
            api.showToast('Perfil actualizado correctamente', false);
        }
    });

    document.getElementById('btnChangePwd').addEventListener('click', showChangePasswordModal);
};
