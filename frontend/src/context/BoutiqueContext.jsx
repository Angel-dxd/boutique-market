import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { parseCSV } from '../utils/csvParser';

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

    // --- State ---
    const [clients, setClients] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [productLabels, setProductLabels] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dailyNotes, setDailyNotes] = useState({});
    const [imports, setImports] = useState([]);
    const [giftCards, setGiftCards] = useState([]);

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

            const [fin, cli, prod, eti, apt, not, imp, card] = await Promise.all([
                fetchTable('finanzas'),
                fetchTable('clientes'),
                fetchTable('productos'),
                fetchTable('etiquetas'),
                fetchTable('appointments'),
                fetchTable('daily_notes'),
                fetchTable('import_logs'),
                fetchTable('gift_cards')
            ]);

            setTransactions(fin);
            setClients(cli);
            setProducts(prod);
            setProductLabels(eti);
            setAppointments(apt);
            setImports(imp);
            setGiftCards(card);

            const notesMap = {};
            not.forEach(n => notesMap[n.date] = n);
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

    // --- Actions: CLIENTES (Mapeado a columnas en español) ---
    const addClient = async (data) => {
        const tempId = Date.now();
        // Mapeamos para que coincida con tu tabla SQL
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

    // --- Actions: FINANZAS (Categorías Arelys) ---
    const addTransaction = async (t) => {
        const dbData = {
            tipo: t.type, // 'entrada' o 'salida'
            categoria: t.category, // 'IPC', 'Nómina', 'Trimestre', 'Compra'
            monto: parseFloat(t.amount),
            nota: t.description || ''
        };

        await dbOp(async () => {
            await supabase.from('finanzas').insert([dbData]);
            await loadData();
        });
    };

    // --- Actions: PRODUCTOS ---
    const addProduct = async (title, labelId) => {
        await dbOp(async () => {
            const { data, error } = await supabase.from('productos').insert([{
                nombre: title,
                label_id: labelId
            }]).select();
            if (error) throw error;
            await loadData();
        });
    };

    // --- Helpers RESTO DE FUNCIONES ---
    const value = {
        clients, addClient, updateClient, deleteClient,
        transactions, addTransaction, loadData,
        appointments, dailyNotes,
        products, productLabels, addProduct,
        isLoading, isSupabaseConnected, connectionError
    };

    return <BoutiqueContext.Provider value={value}>{children}</BoutiqueContext.Provider>;
};