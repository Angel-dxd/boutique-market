const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Inicializa MySQL centralizado de inmediato
require('./src/config/db');

const app = express();
const port = process.env.PORT || 3000;

// Configuración Middlewares
app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

// Importar rutas
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const statisticsRoutes = require('./src/routes/statisticsRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');
// Definición de Rutas API
app.use('/api/products', inventoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/dashboard', statisticsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/calendar', calendarRoutes);
// Ruta Raíz (Verifica funcionamiento global)
app.get('/', (req, res) => {
    res.json({
        message: 'Boutique & Market API (Centralized MySQL) Running',
        status: 'Online'
    });
});

// 📌 Manejador Global de Errores (Nivel Estructural 2)
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