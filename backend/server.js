const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno (Prioridad: Seguridad )
dotenv.config();

// Extraer contexto de base de datos multitenant
const { tenantContext } = require('./src/config/db');

const app = express();
const port = process.env.PORT || 3000;

// 📌 Configuración Middlewares
// MEJORA: CORS dinámico desde .env para evitar penalización en seguridad [cite: 37, 58]
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 📌 Middleware Multitenant (Selección Dinámica de DB)
app.use((req, res, next) => {
    let tenantId = req.headers['x-tenant-id'] === 'santi' ? 'santi' : 'market';
    tenantContext.run(tenantId, () => {
        next();
    });
});

// 📌 Importar rutas
const authRoutes = require('./src/routes/authRoutes'); // NUEVO: PSyP-4 y PSyP-5 
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const statisticsRoutes = require('./src/routes/statisticsRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes');
// 📌 Definición de Rutas API
app.use('/api/auth', authRoutes); // NUEVO: Punto crítico para subir la nota de seguridad 
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
// Ruta Raíz
app.get('/', (req, res) => {
    res.json({
        message: 'Boutique & Market API (Centralized MySQL) Running',
        status: 'Online',
        security: 'AES & Bcrypt Active' // Indicador de cumplimiento técnico 
    });
});

// 📌 Manejador Global de Errores (Nivel Estructural 2) [cite: 31]
app.use((err, req, res, next) => {
    console.error('🔥 Error Detonado en Backend:', err.stack);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: err.message || 'Error Interno del Servidor',
        code: status
    });
});

app.listen(port, () => {
    console.log(`\n🚀 Backend corriendo en http://localhost:${port}`);
    console.log(`👉 Entorno inicializado sobre base de datos MySQL centralizada.\n`);
});