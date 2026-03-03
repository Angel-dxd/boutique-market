const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:4200' // Permitimos el frontend en el puerto 4200
}));
app.use(express.json());

// --- ASEGURAR CARPETA DE DATOS ---
const dataDir = path.resolve(__dirname, './src/data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// --- CONFIGURACIÓN DE SQLITE ---
const dbPath = path.join(dataDir, 'boutique_market.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al abrir SQLite:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos local SQLite.');

        // Inicialización de tablas para Niveles 1 y 2
        db.serialize(() => {
            // Tabla para Arelis (Boutique)
            db.run(`CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                notes TEXT
            )`);

            // Tabla para Santi (Market)
            db.run(`CREATE TABLE IF NOT EXISTS providers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                product TEXT,
                phone TEXT
            )`);

            console.log('📊 Tablas de la base de datos verificadas/creadas.');
        });
    }
});

// Hacer la base de datos accesible a las rutas
app.set('db', db);

// Importación de Rutas
// Asegúrate de que los archivos existan en ./src/routes/
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const statisticsRoutes = require('./src/routes/statisticsRoutes');
const clientRoutes = require('./src/routes/clientRoutes');

// Registro de Rutas API
app.use('/api/products', inventoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/dashboard', statisticsRoutes);
app.use('/api/clients', clientRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Boutique & Market API (SQLite) Running',
        status: 'Online',
        database: 'Connected'
    });
});

// Start Server
app.listen(port, () => {
    console.log(`\n🚀 Backend corriendo en http://localhost:${port}`);
    console.log(`👉 Tu frontend debe lanzarse con: npx serve . -l 4200\n`);
});