import React, { useState } from 'react';
import { Gift, Plus, Copy, CreditCard, Search, Smartphone } from 'lucide-react';
import { useBoutique } from '../../context/BoutiqueContext';

const GiftCardManager = () => {
    const { giftCards, createGiftCard, isSupabaseConnected } = useBoutique();
    const [amount, setAmount] = useState('');
    const [clientName, setClientName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (!amount || !clientName) return;

        createGiftCard(amount, clientName);
        setAmount('');
        setClientName('');
    };

    const filteredCards = giftCards.filter(card =>
        card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Toast logic ideal here
    };

    return (
        <div className="space-y-6 h-full flex flex-col pb-20 md:pb-0">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Tarjetas Regalo</h2>
                    <p className="text-gray-500 text-sm md:text-base">Gestiona saldos para clientes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Creator Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-pink-50 text-pink-500 rounded-xl">
                            <Gift size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">Nueva Tarjeta</h3>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-gray-50"
                                placeholder="Nombre del cliente"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial (€)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-400 font-bold">€</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-gray-50 font-bold text-lg"
                                    placeholder="50.00"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 active:scale-95 mt-2"
                        >
                            <Plus size={20} /> Generar
                        </button>
                    </form>
                </div>

                {/* Cards List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                    <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Smartphone size={18} className="md:hidden text-gray-400" /> Activas
                        </h3>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredCards.map((card) => (
                            <div key={card.code} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/30 transition-all bg-white shadow-sm md:shadow-none gap-4 md:gap-0">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white shadow-md flex-shrink-0">
                                        <CreditCard size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-bold text-gray-800 tracking-wider text-lg md:text-base truncate">{card.code}</p>
                                            <button
                                                onClick={() => copyToClipboard(card.code)}
                                                className="md:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pink-500 transition-all p-1"
                                                title="Copiar Código"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{card.client}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center w-full md:w-auto md:block text-right border-t border-gray-50 md:border-none pt-3 md:pt-0">
                                    <span className="md:hidden text-xs text-gray-400 uppercase font-bold">Saldo</span>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">€{card.balance.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400 hidden md:block">de €{card.initialAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredCards.length === 0 && (
                            <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
                                <Search size={48} className="opacity-20" />
                                <p>No se encontraron tarjetas</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftCardManager;
