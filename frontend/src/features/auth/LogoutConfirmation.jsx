import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const LogoutConfirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check previous path to determine branding
    const isFromMarket = location.state?.from === 'market';
    const themeColor = isFromMarket ? 'bg-[#0077b6]' : 'bg-[#059669]'; // Dynamic Source Color
    const themeName = isFromMarket ? 'El Gallo Azul' : 'Oh-Nails';

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                <div className={`w-16 h-16 rounded-full ${themeColor} text-white flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <LogOut size={32} />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Cerrar Sesión?</h2>
                <p className="text-gray-500 text-sm mb-8">
                    Estás saliendo de <span className="font-bold">{themeName}</span>. Tendrás que volver a ingresar tus credenciales.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className={`w-full ${themeColor} hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all shadow-md`}
                    >
                        Confirmar Salida
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmation;
