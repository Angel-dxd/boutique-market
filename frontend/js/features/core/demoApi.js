/**
 * core/demoApi.js
 * Backend simulado para el Modo Demo.
 *
 * Responde a los mismos endpoints que la API real con datos 100 % ficticios,
 * sin conectar con el servidor ni con las bases de datos de los negocios.
 * Los cambios (crear, editar, borrar) se guardan en sessionStorage, así que
 * duran mientras la pestaña esté abierta y se reinician en la siguiente visita.
 */

const STORAGE_KEY = 'demoData:v1';
export const DEMO_TOKEN_PREFIX = 'demo-token-';

export const isDemoSession = () => (localStorage.getItem('authToken') || '').startsWith(DEMO_TOKEN_PREFIX);

/**
 * Muestra u oculta la etiqueta flotante que avisa de que los datos son ficticios.
 * @param {boolean} visible
 */
export const toggleDemoBadge = (visible) => {
    let badge = document.getElementById('demo-badge');
    if (!visible) {
        badge?.remove();
        return;
    }
    if (badge) return;
    badge = document.createElement('div');
    badge.id = 'demo-badge';
    badge.setAttribute('role', 'status');
    badge.className = 'fixed top-3 left-1/2 -translate-x-1/2 z-[9998] px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold shadow-sm pointer-events-none';
    badge.textContent = 'Modo demo · datos ficticios';
    document.body.appendChild(badge);
};

// --- Utilidades de fecha (relativas a hoy para que la demo siempre tenga datos actuales) ---
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysFromToday = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return ymd(d);
};
const asPgDate = (dateStr) => `${dateStr}T00:00:00.000Z`;
const asPgTimestamp = (offset) => new Date(Date.now() + offset * 86400000).toISOString();

// Imagen de muestra generada en SVG (no se usa ninguna foto real)
const sampleArt = (hueA, hueB, label) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(${hueA},70%,72%)"/><stop offset="1" stop-color="hsl(${hueB},65%,55%)"/>
        </linearGradient></defs>
        <rect width="600" height="600" fill="url(#g)"/>
        <g fill="rgba(255,255,255,0.35)">
            <ellipse cx="160" cy="300" rx="55" ry="120"/><ellipse cx="300" cy="260" rx="58" ry="135"/><ellipse cx="440" cy="300" rx="55" ry="120"/>
        </g>
        <title>${label}</title>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// --- Datos ficticios ---
const buildSeed = () => {
    const clients = [
        ['Lucía Fernández', 2], ['Marta Gómez', 5], ['Paula Navarro', 9], ['Elena Ruiz', 12],
        ['Carmen Ortega', 16], ['Sara Molina', 21], ['Irene Castillo', 27], ['Nuria Vidal', 34],
        ['Raquel Herrera', 41], ['Andrea Prieto', 48], ['Silvia Romero', 63], ['Clara Benítez', 80],
    ].map(([name, daysAgo], i) => ({
        id: i + 1,
        name,
        phone: `600 000 ${pad(10 + i)}`,
        email: `${name.split(' ')[0].toLowerCase()}@example.com`,
        notes: i % 3 === 0 ? 'Prefiere tonos nude. Cliente de ejemplo.' : null,
        last_visit: asPgDate(daysFromToday(-daysAgo)),
        created_at: asPgTimestamp(-200 + i * 5),
        deleted_at: null,
    }));

    const services = [
        ['Semipermanente', 25], ['Esculpidas gel', 45], ['Relleno acrílico', 35],
        ['Manicura rusa', 30], ['Nail art', 40], ['Pedicura completa', 32],
    ];
    const hours = ['09:30', '10:30', '11:30', '12:30', '16:00', '17:00', '18:00'];
    const calendar = [];
    let calId = 1;
    for (let day = -45; day <= 10; day++) {
        const perDay = day === 0 || day === 1 ? 3 : (Math.abs(day) % 3 === 0 ? 0 : 2);
        for (let k = 0; k < perDay; k++) {
            const client = clients[(calId * 5 + k) % clients.length];
            const [service, price] = services[(calId + k) % services.length];
            calendar.push({
                id: calId++,
                client: client.name,
                date: asPgDate(daysFromToday(day)),
                description: hours[(k * 2 + Math.abs(day)) % hours.length],
                profit: String(price.toFixed(2)),
                service,
                created_at: asPgTimestamp(day - 3),
                deleted_at: null,
            });
        }
    }

    const finance = [];
    let finId = 1;
    for (let w = 0; w < 10; w++) {
        finance.push({ id: finId++, amount: String((420 + (w * 37) % 160).toFixed(2)), type: 'income', category: 'Servicios', date: asPgDate(daysFromToday(-w * 7)) });
        if (w % 2 === 0) finance.push({ id: finId++, amount: String((60 + (w * 13) % 50).toFixed(2)), type: 'expense', category: 'Material', date: asPgDate(daysFromToday(-w * 7 - 2)) });
        if (w % 4 === 0) finance.push({ id: finId++, amount: '450.00', type: 'expense', category: 'Alquiler', date: asPgDate(daysFromToday(-w * 7 - 4)) });
    }

    const gallery = [
        ['Francesa clásica', 'Manicura', 330, 350], ['Baby boomer', 'Esculpidas', 20, 340], ['Mármol blanco', 'Nail art', 210, 240],
        ['Degradado coral', 'Semipermanente', 0, 30], ['Flores minimal', 'Nail art', 300, 340], ['Nude elegante', 'Semipermanente', 25, 35],
        ['Cromado plata', 'Esculpidas', 200, 230], ['Ombré lavanda', 'Esculpidas', 260, 290],
    ].map(([title, category, h1, h2], i) => ({
        id: i + 1,
        title,
        category,
        image: sampleArt(h1, h2, title),
        client_id: (i % clients.length) + 1,
        created_at: asPgTimestamp(-i * 4),
    }));

    const providers = [
        { id: 1, name: 'Avícola del Turia', phone: '600 000 101', company: 'Avícola del Turia S.L.', category: 'Producto' },
        { id: 2, name: 'Granja Las Encinas', phone: '600 000 102', company: 'Granja Las Encinas', category: 'Producto' },
        { id: 3, name: 'Envases Levante', phone: '600 000 103', company: 'Envases Levante S.A.', category: 'Suministros' },
        { id: 4, name: 'Especias del Mediterráneo', phone: '600 000 104', company: 'Especias Med', category: 'Producto' },
    ].map((p, i) => ({ ...p, created_at: asPgTimestamp(-120 + i * 10) }));

    const inventory = [
        ['Pollo entero', 5.5, 3.9, 64, 40, 'Aves', 1, 5], ['Pechuga fileteada', 8.9, 6.2, 18, 25, 'Aves', 1, 4],
        ['Muslos de pollo', 4.8, 3.1, 52, 30, 'Aves', 2, 6], ['Alitas adobadas', 6.2, 4.0, 9, 20, 'Elaborados', 2, 3],
        ['Huevos camperos (docena)', 3.2, 2.1, 120, 50, 'Huevos', 2, 21], ['Hamburguesa de pollo', 7.5, 4.6, 33, 20, 'Elaborados', 1, 9],
        ['Pavo en filetes', 10.9, 7.8, 14, 15, 'Aves', 1, 12], ['Bandejas de envasado', 0.15, 0.06, 900, 300, 'Suministros', 3, null],
        ['Bolsas compostables', 0.08, 0.03, 140, 400, 'Suministros', 3, null], ['Adobo casero', 2.5, 1.1, 26, 10, 'Especias', 4, 60],
    ].map(([title, price, cost, stock, min_stock, category, provider_id, expiresIn], i) => ({
        id: i + 1,
        title,
        price: price.toFixed(2),
        cost: cost.toFixed(2),
        stock,
        min_stock,
        category,
        provider_id,
        expiration_date: expiresIn === null ? null : asPgDate(daysFromToday(expiresIn)),
        created_at: asPgTimestamp(-60 + i),
    }));

    const invoices = [
        [1, 1284.5, 'FAC-2026-0141', -3, 'pending'], [2, 860.2, 'GLE-5520', -9, 'paid'],
        [3, 214.75, 'ENV-0932', -15, 'paid'], [1, 1190.0, 'FAC-2026-0127', -24, 'paid'],
        [4, 96.4, 'ESP-118', -31, 'pending'],
    ].map(([provider_id, amount, reference, day, status], i) => ({
        id: i + 1,
        provider_id,
        amount: amount.toFixed(2),
        reference,
        date: asPgDate(daysFromToday(day)),
        status,
        tax_included: true,
        tax_amount: (amount * 0.1).toFixed(2),
        created_at: asPgTimestamp(day),
    }));

    return {
        market: { clients, calendar, finance, gallery },
        santi: { providers, inventory, invoices, finance: [] },
    };
};

// --- Persistencia en la sesión ---
let state = null;
const load = () => {
    if (state) return state;
    try {
        state = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || buildSeed();
    } catch (_) {
        state = buildSeed();
    }
    return state;
};
const save = () => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* sin almacenamiento: la demo sigue en memoria */ }
};

const currentTenant = () => (localStorage.getItem('currentUser') === 'santi' ? 'santi' : 'market');
const table = (name) => {
    const db = load()[currentTenant()];
    if (!db[name]) db[name] = [];
    return db[name];
};
const nextId = (rows) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
const toDateOnly = (value) => (typeof value === 'string' ? value.slice(0, 10) : value);
const httpError = (status, message) => Object.assign(new Error(message), { status });

// --- Lecturas ---
const handleGet = (path, query) => {
    switch (path) {
        case '/clients':
            return { success: true, data: table('clients').filter(c => !c.deleted_at).sort((a, b) => a.name.localeCompare(b.name)) };

        case '/clients/at-risk': {
            const days = parseInt(query.get('days')) || 30;
            const today = new Date(daysFromToday(0));
            const data = table('clients')
                .filter(c => !c.deleted_at && c.last_visit)
                .map(c => ({ ...c, days_since_visit: Math.round((today - new Date(toDateOnly(c.last_visit))) / 86400000) }))
                .filter(c => c.days_since_visit >= days)
                .sort((a, b) => b.days_since_visit - a.days_since_visit);
            return { success: true, data, threshold_days: days };
        }

        case '/calendar/appointments': {
            const rows = table('calendar').filter(r => !r.deleted_at).sort((a, b) => a.date.localeCompare(b.date));
            const calendarEvents = rows.map(r => ({ id: r.id, client: r.client, date: toDateOnly(r.date), description: r.description, profit: parseFloat(r.profit) }));
            return { calendarEvents, totalEarningsPerDay: calendarEvents.reduce((s, r) => s + r.profit, 0) };
        }

        case '/calendar/earnings': {
            const date = query.get('date') || daysFromToday(0);
            const rows = table('calendar').filter(r => !r.deleted_at);
            const sum = (pred) => rows.filter(r => pred(toDateOnly(r.date))).reduce((s, r) => s + parseFloat(r.profit), 0);
            return {
                today: sum(d => d === date),
                month: sum(d => d.slice(0, 7) === date.slice(0, 7)),
                year: sum(d => d.slice(0, 4) === date.slice(0, 4)),
            };
        }

        case '/calendar/dashboard': {
            const rows = table('calendar').filter(r => !r.deleted_at);
            const forDay = (day) => rows
                .filter(r => toDateOnly(r.date) === day)
                .sort((a, b) => (a.description || '').localeCompare(b.description || ''))
                .map(r => ({ id: r.id, client: r.client, time: r.description || '10:00', price: parseFloat(r.profit) }));
            const visits = rows.reduce((acc, r) => ({ ...acc, [r.client]: (acc[r.client] || 0) + 1 }), {});
            const topClients = Object.entries(visits).map(([name, v]) => ({ name, visits: String(v) }))
                .sort((a, b) => b.visits - a.visits).slice(0, 5);
            return { today: forDay(query.get('today')), tomorrow: forDay(query.get('tomorrow')), topClients };
        }

        case '/finance':
            return table('finance').slice().sort((a, b) => b.date.localeCompare(a.date))
                .map(({ id, amount, type, category, date }) => ({ id, amount, type, category, date }));

        case '/gallery': {
            const limit = parseInt(query.get('limit')) || 12;
            const offset = parseInt(query.get('offset')) || 0;
            const clientId = query.get('client_id') ? parseInt(query.get('client_id')) : null;
            return table('gallery')
                .filter(w => !clientId || w.client_id === clientId)
                .sort((a, b) => b.created_at.localeCompare(a.created_at))
                .slice(offset, offset + limit);
        }

        case '/products': {
            const page = parseInt(query.get('page')) || 1;
            const limit = parseInt(query.get('limit')) || 50;
            const rows = table('inventory').slice().sort((a, b) => b.id - a.id);
            return { data: rows.slice((page - 1) * limit, page * limit), total: String(rows.length), page, limit, totalPages: Math.ceil(rows.length / limit) };
        }

        case '/products/alerts': {
            const limitDate = daysFromToday(30);
            return table('inventory')
                .filter(p => p.expiration_date && toDateOnly(p.expiration_date) <= limitDate)
                .sort((a, b) => a.expiration_date.localeCompare(b.expiration_date));
        }

        case '/providers':
            return table('providers').slice().sort((a, b) => a.name.localeCompare(b.name));

        case '/invoices':
            return table('invoices').slice().sort((a, b) => b.id - a.id);

        case '/dashboard/stats': {
            const finance = table('finance');
            const income = finance.filter(f => ['income', 'entrada'].includes(f.type.toLowerCase())).reduce((s, f) => s + parseFloat(f.amount), 0);
            const otherExpenses = finance.filter(f => ['expense', 'salida'].includes(f.type.toLowerCase())).reduce((s, f) => s + parseFloat(f.amount), 0);
            const invoiceTotal = table('invoices').reduce((s, i) => s + parseFloat(i.amount), 0);
            const inventory = table('inventory');
            const totalExpenses = invoiceTotal + otherExpenses;
            const ratio = income > 0 ? (totalExpenses / income) * 100 : 100;
            return {
                totalIncome: income,
                totalExpenses,
                netProfit: income - totalExpenses,
                inventoryValue: inventory.reduce((s, p) => s + p.stock * parseFloat(p.price), 0),
                lowStockCount: inventory.filter(p => p.stock <= p.min_stock).length,
                financialHealth: ratio < 40 ? 'healthy' : 'warning',
                ratio: ratio.toFixed(1),
            };
        }

        default: {
            const byId = path.match(/^\/gallery\/(\d+)$/);
            if (byId) {
                const work = table('gallery').find(w => w.id === parseInt(byId[1]));
                if (!work) throw httpError(404, 'Trabajo no encontrado');
                return work;
            }
            throw httpError(404, 'Ruta no disponible en el modo demo.');
        }
    }
};

// --- Escrituras ---
const RESOURCES = {
    clients: 'clients',
    finance: 'finance',
    gallery: 'gallery',
    products: 'inventory',
    providers: 'providers',
    invoices: 'invoices',
};

const handleWrite = (method, path, body = {}) => {
    if (path === '/auth/change-password') throw httpError(403, 'El cambio de contraseña está desactivado en el modo demo.');
    if (path === '/invoices/scan') throw httpError(400, 'El escaneo de facturas con IA no está disponible en el modo demo.');
    if (path.startsWith('/messages/')) return { success: true, message: 'Mensaje simulado: en el modo demo no se envía nada.' };

    if (path === '/calendar/appointments' || path === '/calendar/appointments/bulk') {
        const rows = table('calendar');
        const items = Array.isArray(body) ? body : (body.appointments || body.events || [body]);
        items.forEach(item => rows.push({
            id: nextId(rows),
            client: item.client || 'Cliente demo',
            date: asPgDate(toDateOnly(item.date) || daysFromToday(0)),
            description: item.description || item.time || '10:00',
            profit: String(parseFloat(item.profit ?? item.price ?? 0).toFixed(2)),
            created_at: new Date().toISOString(),
            deleted_at: null,
        }));
        save();
        return path.endsWith('/bulk') ? { message: `Se importaron ${items.length} eventos exitosamente.` } : { success: true, id: rows[rows.length - 1].id };
    }

    const [, resource, rawId, sub] = path.split('/');
    const tableName = RESOURCES[resource];
    if (!tableName) throw httpError(404, 'Ruta no disponible en el modo demo.');
    const rows = table(tableName);
    const id = rawId ? parseInt(rawId) : null;

    if (method === 'POST' && !id) {
        const record = { ...body, id: nextId(rows), created_at: new Date().toISOString() };
        if (tableName === 'clients') Object.assign(record, { deleted_at: null, last_visit: record.last_visit || null });
        if (record.date) record.date = asPgDate(toDateOnly(record.date));
        rows.push(record);
        save();
        return tableName === 'clients' ? { success: true, data: record } : { success: true, id: record.id, ...record };
    }

    const index = rows.findIndex(r => r.id === id);
    if (index === -1) throw httpError(404, 'Registro no encontrado.');

    if (method === 'PUT') {
        rows[index] = sub === 'stock' ? { ...rows[index], stock: body.stock } : { ...rows[index], ...body, id };
        save();
        return { success: true, data: { message: 'Actualizado (modo demo).' } };
    }

    if (method === 'DELETE') {
        if (tableName === 'clients') rows[index].deleted_at = new Date().toISOString();
        else rows.splice(index, 1);
        save();
        return { success: true, data: { message: 'Eliminado (modo demo).' } };
    }

    throw httpError(405, 'Operación no soportada en el modo demo.');
};

/**
 * Punto de entrada usado por core/api.js cuando la sesión es de demo.
 * Simula una pequeña latencia de red para que la interfaz se comporte igual que en producción.
 */
export const demoRequest = async (method, endpoint, body) => {
    await new Promise(resolve => setTimeout(resolve, 120));
    const url = new URL(endpoint, 'http://demo.local');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (method === 'GET') return handleGet(path, url.searchParams);
    return handleWrite(method, path, body);
};
