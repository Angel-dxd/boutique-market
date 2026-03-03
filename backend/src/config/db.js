const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Creamos el archivo de la base de datos en la carpeta 'data'
const dbPath = path.resolve(__dirname, '../data/boutique_market.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite: Boutique & Market');
        createTables();
    }
});

function createTables() {
    // Tabla para los pollos y proveedores de Santi (Market)
    db.run(`CREATE TABLE IF NOT EXISTS providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        product TEXT,
        phone TEXT
    )`);

    // Tabla para las clientas de uñas de Arelis (Boutique)
    db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        last_visit DATE
    )`);
}

module.exports = db;