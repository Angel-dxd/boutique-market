import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const LoginView = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Mock Authentication Logic
        if (username.toLowerCase() === 'arelys' && password === '123') {
            navigate('/boutique-welcome');
        } else if (username.toLowerCase() === 'santi' && password === '123') {
            navigate('/market');
        } else {
            setError('Credenciales incorrectas. Intenta con arelys/123 o santi/123');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row h-[600px]">

                {/* Visual Side */}
                <div className="md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        {/* Abstract Patterns */}
                        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-emerald-500 blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-blue-500 blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
                        <p className="text-gray-400">Sistema de Gestión Integral</p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-3 h-3 rounded-full bg-[#059669]"></div>
                                <span className="font-bold">Oh-Nails</span>
                            </div>
                            <p className="text-xs text-gray-400">Gestión de Estética</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-3 h-3 rounded-full bg-[#0077b6]"></div>
                                <span className="font-bold">El Gallo Azul</span>
                            </div>
                            <p className="text-xs text-gray-400">Gestión de Pollería</p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 relative z-10">© 2026 Marquez Family Business</p>
                </div>

                {/* Login Form Side */}
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    placeholder="Ej: arelys"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
                        >
                            Entrar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
