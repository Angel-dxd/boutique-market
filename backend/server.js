/**
 * server.js
 * Punto de entrada principal del backend para Boutique & Market.
 * Configura middlewares de seguridad, gestión multitenant y registro de rutas.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

// Carga de variables de entorno
dotenv.config();

console.log('--- BACKEND STARTING ---');
console.log(`🕒 Hora: ${new Date().toISOString()}`);
console.log(`🆔 Proceso: ${process.pid}`);

/**
 * Contexto de Tenant: Permite el aislamiento de datos por base de datos
 * dependiendo del identificador enviado en la cabecera 'x-tenant-id'.
 */
const { tenantContext } = require('./src/config/db');

const app = express();
const port = process.env.PORT || 3000;

// ─── Middlewares de seguridad y parseo ───────────────────────────────────────
app.use(helmet()); // cabeceras de seguridad HTTP con una línea

// CORS: en producción se restringe a los orígenes permitidos vía env;
// en desarrollo se acepta cualquier origen (útil para móviles en LAN).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (process.env.NODE_ENV !== 'production') return cb(null, true);
        if (!origin) return cb(null, true); // peticiones server-to-server / curl
        if (allowedOrigins.length === 0) return cb(null, true); // fallback abierto si no hay config
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS bloqueado para origen: ${origin}`));
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' })); // 50mb es excesivo — reduce la superficie de ataque
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Middleware Multitenant ───────────────────────────────────────────────────
app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'] === 'santi' ? 'santi' : 'market';
    tenantContext.run(tenantId, () => next());
});

// ─── Rutas ────────────────────────────────────────────────────────────────────
const { requireAuth } = require('./src/middlewares/auth');
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
app.use('/api/products', requireAuth, inventoryRoutes);
app.use('/api/providers', requireAuth, providerRoutes);
app.use('/api/dashboard', requireAuth, statisticsRoutes);
app.use('/api/clients', requireAuth, clientRoutes);
app.use('/api/invoices', requireAuth, invoiceRoutes);
app.use('/api/finance', requireAuth, financeRoutes);
app.use('/api/calendar', requireAuth, calendarRoutes);
app.use('/api/messages', requireAuth, messageRoutes);
app.use('/api/gallery', requireAuth, galleryRoutes);
app.use('/api/nails', requireAuth, require('./src/routes/nailsRoutes'));

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
//
// Códigos de error PostgreSQL (SQLSTATE) más comunes:
//   23505  →  unique_violation (clave duplicada)
//   23503  →  foreign_key_violation
//   23502  →  not_null_violation
//   42703  →  undefined_column
//   42P01  →  undefined_table
//
// Documentación oficial: https://www.postgresql.org/docs/current/errcodes-appendix.html
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

    // Clave duplicada en BD
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            errors: ["Ya existe un registro con esos datos (valor duplicado)."]
        });
    }

    // Violación de clave foránea
    if (err.code === '23503') {
        return res.status(409).json({
            success: false,
            errors: ["No se puede completar: existen registros relacionados."]
        });
    }

    // Campo o tabla inexistente en BD
    if (err.code === '42703' || err.code === '42P01') {
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
    console.log(`🔧 Intentando arrancar servidor en puerto ${port}...`);
    app.listen(port, '0.0.0.0', () => {
        console.log(`\n🚀 Backend corriendo en http://0.0.0.0:${port}`);
        console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📡 Orígenes permitidos: ${process.env.ALLOWED_ORIGINS || 'TODOS (Cuidado)'}\n`);
    });
}

module.exports = app;
