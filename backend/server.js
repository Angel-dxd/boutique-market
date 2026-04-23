const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // añade esto si no lo tienes: npm install helmet
const dotenv = require('dotenv');

dotenv.config();

const { tenantContext } = require('./src/config/db');

const app = express();
const port = process.env.PORT || 3000;

// ─── Middlewares de seguridad y parseo ───────────────────────────────────────
app.use(helmet()); // cabeceras de seguridad HTTP con una línea
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
}));
app.use(express.json({ limit: '10mb' })); // 50mb es excesivo — reduce la superficie de ataque
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Middleware Multitenant ───────────────────────────────────────────────────
app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'] === 'santi' ? 'santi' : 'market';
    tenantContext.run(tenantId, () => next());
});

// ─── Rutas ────────────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/authRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const statisticsRoutes = require('./src/routes/statisticsRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', inventoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/dashboard', statisticsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/nails', require('./src/routes/nailsRoutes'));

app.get('/', (req, res) => {
    res.json({
        message: 'Boutique & Market API Running',
        status: 'Online',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ─── 404 — Ruta no encontrada ─────────────────────────────────────────────────
// DEBE ir después de todas las rutas y ANTES del error handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        errors: [`Ruta no encontrada: ${req.method} ${req.originalUrl}`]
    });
});

// ─── Error Handler Global ─────────────────────────────────────────────────────
// DEBE ser el ÚLTIMO middleware — Express lo identifica por tener 4 parámetros (err, req, res, next)
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

    // Clave duplicada en BD
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            errors: ["Ya existe un registro con esos datos (valor duplicado)."]
        });
    }

    // Campo inexistente en BD
    if (err.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({
            success: false,
            errors: ["Error interno en la consulta a la base de datos."]
        });
    }

    // Resto de errores
    const statusCode = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? "Error interno del servidor."
        : err.message || "Error interno del servidor.";

    res.status(statusCode).json({
        success: false,
        errors: [message]
    });
});

// ─── Arranque ─────────────────────────────────────────────────────────────────
if (require.main === module) {
    app.listen(port, () => {
        console.log(`\n🚀 Backend corriendo en http://localhost:${port}`);
        console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
    });
}

module.exports = app;