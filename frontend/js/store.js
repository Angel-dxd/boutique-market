// Central Store for Data Persistence and Logic
// Mimics the behavior of the original BoutiqueContext but uses LocalStorage for now.

class BoutiqueStore {
    constructor() {
        this.listeners = [];
        this.state = this.loadState();

        // Expose store globally for debugging
        window.boutiqueStore = this;
    }

    // --- Core State Management ---

    loadState() {
        // Initial Mock Data if empty
        const defaultState = {
            clients: [
                { id: 1, name: 'Lucía Méndez', phone: '600123456', email: 'lucia@example.com', notes: 'Prefiere tonos pastel' },
                { id: 2, name: 'Carmen Rojas', phone: '600654321', email: 'carmen@example.com', notes: 'Alergia a cierto acrílico' }
            ],
            transactions: [
                { id: 1, type: 'income', category: 'Cobros Booksy', amount: 150.00, date: new Date().toISOString().split('T')[0], description: 'Cierre de caja ayer' },
                { id: 2, type: 'expense', category: 'Compra Productos', amount: 45.50, date: new Date().toISOString().split('T')[0], description: 'Reposición Esmaltes' }
            ],
            appointments: [
                { client: 'Lucía Méndez', type: 'Corte', time: '10:00', price: 25, date: new Date().toISOString().split('T')[0] }
            ],
            dailyNotes: {},
            products: [
                { id: 1, title: 'Pollo Entero', stock: 15, price: 4.50, min_stock: 5, bg: 'bg-orange-100', icon: 'drumstick' },
                { id: 2, title: 'Chuletas Cerdo', stock: 3, price: 6.90, min_stock: 5, bg: 'bg-pink-100', icon: 'beef' },
            ],
            suppliers: [
                { id: 1, nombre: 'Avícola del Sur', telefono: '954000111', empresa: 'Avícola Sur S.L.', categoria: 'Producto' },
            ],
            invoices: []
        };

        const saved = localStorage.getItem('boutique_state');
        return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
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
            amount: invoice.monto,
            description: `Pago Factura: ${invoice.referencia || 'Sin Ref'}`,
            date: new Date().toISOString().split('T')[0]
        });

        this.saveState();
    }
}

export const store = new BoutiqueStore();