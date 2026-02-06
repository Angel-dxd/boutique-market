import React, { useState, useEffect } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { Calculator, TrendingUp, Save, ShoppingBag, ArrowRight, DollarSign } from 'lucide-react';

const Herramientas = () => {
    const { products } = useBoutique();
    const [activeTab, setActiveTab] = useState('calculadora');

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-gray-800 mb-2">Herramientas</h1>
            <p className="text-gray-500 font-medium mb-8">Utilidades para optimizar tu negocio</p>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('calculadora')}
                    className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'calculadora' ? 'bg-[#1e293b] text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    <Calculator size={20} /> Calculadora Márgenes
                </button>
                <button
                    onClick={() => setActiveTab('comparador')}
                    className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'comparador' ? 'bg-[#1e293b] text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    <ShoppingBag size={20} /> Comparador Precios
                </button>
            </div>

            {activeTab === 'calculadora' ? <CalculadoraMargenes /> : <ComparadorPrecios products={products} />}
        </div>
    );
};

// --- SUB-COMPONENT: CALCULADORA DE MÁRGENES ---
const CalculadoraMargenes = () => {
    const [values, setValues] = useState({ cost: '', expenses: '', margin: 30 });
    const [result, setResult] = useState(null);

    const calculate = () => {
        const cost = parseFloat(values.cost) || 0;
        const expenses = parseFloat(values.expenses) || 0;
        const marginPercent = parseFloat(values.margin) / 100;

        const totalCost = cost + expenses;
        // Formula: Price = Cost / (1 - Margin%)
        const price = totalCost / (1 - marginPercent);
        const profit = price - totalCost;

        setResult({ price, profit, totalCost });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                    <Calculator className="text-blue-500" /> Datos del Producto
                </h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Coste Materia Prima (€)</label>
                        <input
                            type="number"
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-black text-gray-800 outline-none focus:ring-4 focus:ring-blue-50 text-xl"
                            placeholder="0.00"
                            value={values.cost}
                            onChange={e => setValues({ ...values, cost: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gastos Extra (Luz, Gas, etc.)</label>
                        <input
                            type="number"
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-black text-gray-800 outline-none focus:ring-4 focus:ring-blue-50 text-xl"
                            placeholder="0.00"
                            value={values.expenses}
                            onChange={e => setValues({ ...values, expenses: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Margen Deseado (%)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range" min="10" max="90" step="5"
                                className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                value={values.margin}
                                onChange={e => setValues({ ...values, margin: e.target.value })}
                            />
                            <span className="font-black text-2xl text-blue-600 w-16 text-right">{values.margin}%</span>
                        </div>
                    </div>
                    <button
                        onClick={calculate}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        CALCULAR PRECIO
                    </button>
                </div>
            </div>

            <div className="bg-[#1e293b] p-8 rounded-[40px] shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
                {!result ? (
                    <div className="text-center opacity-50">
                        <TrendingUp size={48} className="mx-auto mb-4" />
                        <p className="font-bold text-xl">Introduce datos para calcular</p>
                    </div>
                ) : (
                    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Precio de Venta Recomendado</p>
                            <h2 className="text-6xl font-black text-green-400">
                                {result.price.toFixed(2)}€
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                <p className="text-gray-400 text-xs font-bold uppercase">Coste Total</p>
                                <p className="text-2xl font-bold">{result.totalCost.toFixed(2)}€</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                <p className="text-gray-400 text-xs font-bold uppercase">Beneficio Neto</p>
                                <p className="text-2xl font-bold text-blue-300">+{result.profit.toFixed(2)}€</p>
                            </div>
                        </div>

                        <div className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-2xl text-orange-200 text-sm font-medium">
                            💡 Tip: Si vendes a {Math.ceil(result.price)}€, obtendrás un margen ligeramente superior.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: COMPARADOR DE PRECIOS ---
const ComparadorPrecios = ({ products }) => {
    // Local storage persistence mock
    const [rows, setRows] = useState(() => {
        const saved = localStorage.getItem('santi_comparator');
        return saved ? JSON.parse(saved) : [{ id: 1, product: 'Pollo Entero', provA: 4.50, provB: 4.20, nameA: 'Avinatur', nameB: 'Pollos Planes' }];
    });

    const updateRow = (id, field, value) => {
        const newRows = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
        setRows(newRows);
        localStorage.setItem('santi_comparator', JSON.stringify(newRows));
    };

    const addRow = () => {
        const newRow = { id: Date.now(), product: '', provA: 0, provB: 0, nameA: 'Prov A', nameB: 'Prov B' };
        setRows([...rows, newRow]);
    };

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <ShoppingBag className="text-green-500" /> Comparador de Proveedores
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left">
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Producto</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proveedor A</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Precio A</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proveedor B</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Precio B</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map(row => {
                            const isACheaper = parseFloat(row.provA) < parseFloat(row.provB);
                            const isBCheaper = parseFloat(row.provB) < parseFloat(row.provA);

                            return (
                                <tr key={row.id} className="group hover:bg-gray-50">
                                    <td className="p-4">
                                        <input
                                            className="bg-transparent font-bold text-gray-800 outline-none w-full"
                                            placeholder="Nombre producto..."
                                            value={row.product}
                                            onChange={e => updateRow(row.id, 'product', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            className="bg-transparent text-gray-600 outline-none w-full"
                                            placeholder="Nombre Prov A"
                                            value={row.nameA}
                                            onChange={e => updateRow(row.id, 'nameA', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-1 font-black ${isACheaper ? 'text-green-600' : 'text-gray-400'}`}>
                                            <input
                                                type="number"
                                                className="bg-transparent outline-none w-20"
                                                value={row.provA}
                                                onChange={e => updateRow(row.id, 'provA', e.target.value)}
                                            />
                                            {isACheaper && <TrendingUp size={16} className="rotate-180" />}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <input
                                            className="bg-transparent text-gray-600 outline-none w-full"
                                            placeholder="Nombre Prov B"
                                            value={row.nameB}
                                            onChange={e => updateRow(row.id, 'nameB', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-1 font-black ${isBCheaper ? 'text-green-600' : 'text-gray-400'}`}>
                                            <input
                                                type="number"
                                                className="bg-transparent outline-none w-20"
                                                value={row.provB}
                                                onChange={e => updateRow(row.id, 'provB', e.target.value)}
                                            />
                                            {isBCheaper && <TrendingUp size={16} className="rotate-180" />}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <button
                onClick={addRow}
                className="mt-6 w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-200 hover:text-blue-500 transition-colors"
            >
                + Añadir Fila
            </button>
        </div>
    );
};

export default Herramientas;
