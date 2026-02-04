import React, { useState } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import {
    TrendingUp, TrendingDown, DollarSign,
    Upload, FileText, Plus, X, AlertCircle, CheckCircle,
    ShoppingBag, Users, Home, PieChart, CreditCard
} from 'lucide-react';

const FinanceDashboard = () => {
    const {
        transactions, addTransaction, getFinancialSummary,
        importTransactionsFromCSV, isSupabaseConnected
    } = useBoutique();

    const summary = getFinancialSummary();
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    // Módulo Arelys: Categorías Específicas
    const expenseCategories = [
        { id: 'Compra Productos', label: 'Compra Productos', icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
        { id: 'Nóminas', label: 'Nóminas', icon: Users, color: 'bg-blue-100 text-blue-600' },
        { id: 'IPC', label: 'IPC / Alquiler', icon: Home, color: 'bg-purple-100 text-purple-600' },
        { id: 'Trimestre', label: 'Trimestre', icon: PieChart, color: 'bg-red-100 text-red-600' },
    ];

    return (
        <div className="space-y-6 pb-24 md:pb-0">
            {/* Header y KPIs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Finanzas
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSupabaseConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isSupabaseConnected ? 'CLOUD' : 'OFFLINE'}
                        </span>
                    </h2>
                </div>
                <button
                    onClick={() => setIsIncomeModalOpen(true)}
                    className="w-full md:w-auto px-6 py-2 bg-boutique text-white rounded-xl hover:opacity-90 font-bold shadow-lg shadow-boutique/20 flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Registrar Movimiento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Beneficio Neto</p>
                    <p className={`text-3xl font-bold ${summary.netProfit >= 0 ? 'text-boutique' : 'text-red-500'}`}>
                        {summary.netProfit.toFixed(2)}€
                    </p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-emerald-600 text-xs font-bold uppercase">Ingresos</p>
                        <p className="text-xl font-bold text-gray-800">{summary.totalIncome.toFixed(2)}€</p>
                    </div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-red-500 text-xs font-bold uppercase">Gastos</p>
                        <p className="text-xl font-bold text-gray-800">{summary.totalExpenses.toFixed(2)}€</p>
                    </div>
                </div>
            </div>

            {/* Lista Movimientos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {transactions.map((t) => (
                        <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                    {t.type === 'income' ? <DollarSign size={20} /> : <ShoppingBag size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{t.category}</p>
                                    <p className="text-xs text-gray-400">{t.description || t.date}</p>
                                </div>
                            </div>
                            <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}€
                            </span>
                        </div>
                    ))}
                    {transactions.length === 0 && <p className="p-8 text-center text-gray-400">No hay movimientos registrados.</p>}
                </div>
            </div>

            {/* Modal de Registro Express */}
            {isIncomeModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Registrar</h3>
                            <button onClick={() => setIsIncomeModalOpen(false)}><X size={24} className="text-gray-400" /></button>
                        </div>

                        <ExpenseForm
                            onClose={() => setIsIncomeModalOpen(false)}
                            onAdd={addTransaction}
                            categories={expenseCategories}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const ExpenseForm = ({ onClose, onAdd, categories }) => {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            date: new Date().toISOString().split('T')[0],
            type,
            amount: parseFloat(amount) || 0,
            category: category || (type === 'income' ? 'Cobros Booksy' : 'Gasto General'),
            description
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
                <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-lg font-bold transition-all ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>Gasto</button>
                <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-lg font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400'}`}>Ingreso</button>
            </div>

            {/* Amount */}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">€</span>
                <input
                    type="number" step="0.01" placeholder="0.00" autoFocus
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-3xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-boutique"
                    value={amount} onChange={e => setAmount(e.target.value)}
                />
            </div>

            {/* Categories Grid - LEVEL ARELYS */}
            {type === 'expense' ? (
                <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${category === cat.id ? 'border-boutique bg-orange-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                        >
                            <div className={`p-2 rounded-full ${cat.color}`}>
                                <cat.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-gray-600 uppercase">{cat.label}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setCategory('Cobros Booksy')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${category === 'Cobros Booksy' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}>
                        <CreditCard className="text-emerald-500" size={24} />
                        <span className="text-xs font-bold text-gray-600">BOOKSY</span>
                    </button>
                    <button type="button" onClick={() => setCategory('Efectivo')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${category === 'Efectivo' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}>
                        <DollarSign className="text-emerald-500" size={24} />
                        <span className="text-xs font-bold text-gray-600">EFECTIVO</span>
                    </button>
                </div>
            )}

            <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform">
                Guardar
            </button>
        </form>
    );
};

export default FinanceDashboard;
