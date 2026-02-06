import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { parseCSV, parseProviderCSV } from '../utils/csvParser';

const BoutiqueContext = createContext();

export const useBoutique = () => {
    const context = useContext(BoutiqueContext);
    if (!context) throw new Error('useBoutique must be used within BoutiqueProvider');
    return context;
};

export const BoutiqueProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // --- State: Arelys ---
    const [clients, setClients] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [productLabels, setProductLabels] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dailyNotes, setDailyNotes] = useState({});

    // --- State: Santi ---
    const [proveedores, setProveedores] = useState([]);
    const [facturas, setFacturas] = useState([]);

    // --- Data Loading ---
    const loadData = async () => {
        if (!supabase) {
            setConnectionError('Faltan claves API');
            setIsLoading(false);
            return;
        }

        try {
            const fetchTable = async (name) => {
                const { data, error } = await supabase.from(name).select('*');
                if (error) console.warn(`Tabla ${name} no disponible:`, error.message);
                return data || [];
            };

            // Carga masiva de todas las tablas (Arelys + Santi)
            const [fin, cli, prod, eti, apt, not, prov, fact] = await Promise.all([
                fetchTable('finanzas'),
                fetchTable('clientes'),
                fetchTable('productos'),
                fetchTable('etiquetas'),
                fetchTable('appointments'),
                fetchTable('daily_notes'),
                fetchTable('proveedores'),
                fetchTable('facturas')
            ]);

            setTransactions(fin || []);
            setClients(cli || []);
            setProducts(prod || []);
            setProductLabels(eti || []);
            setAppointments(apt || []);
            setProveedores(prov || []);
            setFacturas(fact || []);

            const notesMap = {};
            if (Array.isArray(not)) {
                not.forEach(n => notesMap[n.date] = n);
            }
            setDailyNotes(notesMap);

            setIsSupabaseConnected(true);
            setConnectionError(null);
        } catch (err) {
            console.error('Error de Conexión:', err.message);
            setConnectionError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const dbOp = async (operation) => {
        if (!supabase) return { error: 'No connection' };
        try {
            return await operation();
        } catch (e) {
            console.error('DB Error:', e);
            return { error: e.message };
        }
    };

    // --- Actions: CLIENTES (Arelys) ---
    const addClient = async (data) => {
        const dbData = {
            nombre: data.name || data.nombre,
            telefono: data.phone || data.telefono,
            notas: data.notes || data.notas
        };

        await dbOp(async () => {
            const { data: real, error } = await supabase.from('clientes').insert([dbData]).select();
            if (error) throw error;
            if (real) setClients(prev => [...prev, real[0]]);
        });
        return { success: true };
    };

    const updateClient = async (id, data) => {
        const dbData = {
            nombre: data.name || data.nombre,
            telefono: data.phone || data.telefono,
            notas: data.notes || data.notas
        };
        await dbOp(async () => {
            await supabase.from('clientes').update(dbData).eq('id', id);
            await loadData();
        });
        return { success: true };
    };

    const deleteClient = async (id) => {
        await dbOp(async () => {
            await supabase.from('clientes').delete().eq('id', id);
            setClients(prev => prev.filter(c => c.id !== id));
        });
        return { success: true };
    };

    // --- Actions: FINANZAS (Flujo Contable) ---
    const addTransaction = async (t) => {
        const dbData = {
            tipo: t.type || t.tipo, // 'entrada' o 'salida'
            categoria: t.category || t.categoria,
            monto: parseFloat(t.amount || t.monto),
            nota: t.description || t.nota || ''
        };

        await dbOp(async () => {
            await supabase.from('finanzas').insert([dbData]);
            await loadData();
        });
    };

    // --- Actions: PROVEEDORES Y FACTURAS (Santi) ---
    const addProveedor = async (data) => {
        await dbOp(async () => {
            const { error } = await supabase.from('proveedores').insert([data]);
            if (error) throw error;
            await loadData();
        });
        return { success: true };
    };

    const updateProveedor = async (id, data) => {
        await dbOp(async () => {
            const { error } = await supabase.from('proveedores').update(data).eq('id', id);
            if (error) throw error;
            await loadData();
        });
        return { success: true };
    };

    const deleteProveedor = async (id) => {
        await dbOp(async () => {
            const { error } = await supabase.from('proveedores').delete().eq('id', id);
            if (error) throw error;
            await loadData();
        });
        return { success: true };
    };

    // --- Actions: PRODUCTOS (Inventario) ---
    const addProduct = async (data) => {
        await dbOp(async () => {
            const { error } = await supabase.from('productos').insert([data]);
            if (error) throw error;
            await loadData();
        });
        return { success: true };
    };

    const updateProduct = async (id, data) => {
        await dbOp(async () => {
            const { error } = await supabase.from('productos').update(data).eq('id', id);
            if (error) throw error;
            await loadData();
        });
        return { success: true };
    };

    const deleteProduct = async (id) => {
        await dbOp(async () => {
            const { error } = await supabase.from('productos').delete().eq('id', id);
            if (error) throw error;
            await loadData();
        });
        return { success: true };
    };

    const addFactura = async (data) => {
        await dbOp(async () => {
            // 1. Insertamos la factura en la tabla de Santi
            const { error } = await supabase.from('facturas').insert([data]);
            if (error) throw error;

            // 2. Registramos automáticamente el gasto en Finanzas para Arelys
            await addTransaction({
                tipo: 'salida',
                categoria: 'Factura Proveedor',
                monto: data.monto,
                nota: `Factura de proveedor: ${data.referencia || 'Sin Ref'}`
            });
        });
        return { success: true };
    };

    // --- Actions: IMPORTACIÓN BOOKSY ---
    const importTransactionsFromCSV = async (file) => {
        try {
            const { data, count, error } = await parseCSV(file);
            if (error) return { success: false, error };

            const finanzasData = data.map(row => ({
                tipo: 'entrada',
                categoria: 'Cobros Booksy',
                monto: parseFloat(row.amount || 0),
                nota: row.description || 'Importación Automática'
            }));

            await dbOp(async () => {
                if (finanzasData.length > 0) {
                    await supabase.from('finanzas').insert(finanzasData);
                }
                await loadData();
            });

            return { success: true, count };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Error procesando archivo' };
        }
    };

    const importProveedoresFromCSV = async (file) => {
        try {
            const { data, count, error } = await parseProviderCSV(file);
            if (error) return { success: false, error };

            await dbOp(async () => {
                if (data.length > 0) {
                    await supabase.from('proveedores').insert(data);
                }
                await loadData();
            });

            return { success: true, count };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Error procesando archivo' };
        }
    };

    // --- Helpers ---
    const getFinancialSummary = () => {
        const safeTransactions = Array.isArray(transactions) ? transactions : [];
        let income = 0;
        let expenses = 0;

        safeTransactions.forEach(t => {
            const type = (t.type || t.tipo || '').toLowerCase();
            const amount = parseFloat(t.amount || t.monto || 0);

            if (['income', 'entrada', 'cobro'].includes(type)) {
                income += amount;
            } else if (['expense', 'salida', 'gasto'].includes(type)) {
                expenses += amount;
            }
        });

        return { totalIncome: income, totalExpenses: expenses, netProfit: income - expenses };
    };

    const value = {
        clients, addClient, updateClient, deleteClient,
        transactions, addTransaction, importTransactionsFromCSV, getFinancialSummary,
        proveedores, facturas, addProveedor, updateProveedor, deleteProveedor, addFactura, importProveedoresFromCSV,
        appointments, dailyNotes, products, productLabels, addProduct, updateProduct, deleteProduct,
        isLoading, isSupabaseConnected, connectionError, loadData
    };

    return <BoutiqueContext.Provider value={value}>{children}</BoutiqueContext.Provider>;
};