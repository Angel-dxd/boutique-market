/**
 * core/store.js
 * Almacén central (Store) para caché de sesión y operaciones offline-first.
 * Todos los datos reales provienen de la API REST (PostgreSQL / Supabase).
 * Este store NO contiene datos mock — el estado inicial es siempre vacío.
 */

/**
 * Clase que gestiona el estado global de la aplicación.
 * Implementa el patrón Observador para notificar cambios a los componentes.
 */
class BoutiqueStore {
    constructor() {
        this.listeners = [];
        this.state = this.loadState();

        // Exponer el store globalmente para facilitar la depuración desde la consola
        window.boutiqueStore = this;
    }

    // --- Core State Management ---

    /**
     * Carga el estado desde localStorage o retorna el estado vacío por defecto.
     * Los datos reales son gestionados exclusivamente por la API.
     * @returns {Object} El estado de sesión.
     */
    loadState() {
        const defaultState = {
            clients: [],
            transactions: [],
            appointments: [],
            dailyNotes: {},
            products: [],
            suppliers: [],
            invoices: []
        };

        try {
            const saved = localStorage.getItem('boutique_state');
            return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
        } catch {
            return defaultState;
        }
    }

    // --- NUEVA FUNCIÓN PARA SQLITE (AÑADIDA) ---
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
        localStorage.setItem('boutique_state', JSON.stringify(this.state));
    }

    saveState() {
        localStorage.setItem('boutique_state', JSON.stringify(this.state));
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(l => l(this.state));
    }

    getState() {
        return this.state;
    }

    // --- Actions: Clients (Arelys) ---

    addClient(client) {
        const newClient = { ...client, id: Date.now() };
        this.state.clients.push(newClient);
        this.saveState();
        return { success: true };
    }

    updateClient(id, data) {
        const index = this.state.clients.findIndex(c => c.id === id);
        if (index !== -1) {
            this.state.clients[index] = { ...this.state.clients[index], ...data };
            this.saveState();
        }
    }

    deleteClient(id) {
        this.state.clients = this.state.clients.filter(c => c.id !== id);
        this.saveState();
    }

    // --- Actions: Finance (Arelys) ---

    addTransaction(transaction) {
        const newTx = { ...transaction, id: Date.now() };
        this.state.transactions.unshift(newTx); // Newest first
        this.saveState();
    }

    getFinancialSummary() {
        let income = 0;
        let expenses = 0;
        this.state.transactions.forEach(t => {
            if (t.type === 'income' || t.type === 'entrada') income += parseFloat(t.amount || 0);
            if (t.type === 'expense' || t.type === 'salida') expenses += parseFloat(t.amount || 0);
        });
        return { totalIncome: income, totalExpenses: expenses, netProfit: income - expenses };
    }

    // --- Actions: Appointment Calendar (Arelys) ---

    addAppointment(apt) {
        this.state.appointments.push({ ...apt, id: Date.now() });
        this.saveState();
    }

    saveDailyNote(date, content, revenue) {
        this.state.dailyNotes[date] = { content, revenue, date };
        this.saveState();
    }

    // --- Actions: Market (Santi) ---

    // Proveedores
    addSupplier(supplier) {
        this.state.suppliers.push({ ...supplier, id: Date.now() });
        this.saveState();
    }

    updateSupplier(id, data) {
        const index = this.state.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            this.state.suppliers[index] = { ...this.state.suppliers[index], ...data };
            this.saveState();
        }
    }

    deleteSupplier(id) {
        this.state.suppliers = this.state.suppliers.filter(s => s.id !== id);
        this.saveState();
    }

    // Inventario
    addProduct(product) {
        this.state.products.push({ ...product, id: Date.now() });
        this.saveState();
    }

    updateProduct(id, data) {
        const index = this.state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.state.products[index] = { ...this.state.products[index], ...data };
            this.saveState();
        }
    }

    deleteProduct(id) {
        this.state.products = this.state.products.filter(p => p.id !== id);
        this.saveState();
    }

    // Facturas / Pedidos
    addInvoice(invoice) {
        // 1. Add Invoice for Santi
        const newInvoice = { ...invoice, id: Date.now(), created_at: new Date().toISOString() };
        this.state.invoices.push(newInvoice);

        // 2. Automatically add expense for Arelys/Global Finance
        this.addTransaction({
            type: 'expense',
            category: 'Factura Proveedor',
            amount: invoice.amount,
            description: `Pago Factura: ${invoice.reference || 'Sin Ref'}`,
            date: new Date().toISOString().split('T')[0]
        });

        this.saveState();
    }
}

export const store = new BoutiqueStore();