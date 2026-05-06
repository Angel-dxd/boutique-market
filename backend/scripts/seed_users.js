require('dotenv').config();
const bcrypt = require('bcrypt');
const { encrypt } = require('../src/utils/crypto');
const db = require('../src/config/db');
const { tenantContext } = require('../src/config/db');

const SALT_ROUNDS = 10;

async function seedUsers() {
    try {
        console.log('🌱 Iniciando seed de usuarios...');
        
        // Cifrar contraseña por defecto '123'
        const passwordHash = await bcrypt.hash('123', SALT_ROUNDS);

        // 1. Crear usuario Arelys en tenant 'market'
        await tenantContext.run('market', async () => {
            console.log("Ejecutando en tenant 'market'...");
            const emailEncrypted = encrypt('arelys@boutique.com');
            
            // Verificar si existe
            const [users] = await db.execute('SELECT * FROM users WHERE username = ?', ['arelys']);
            if (users.length === 0) {
                await db.execute(
                    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                    ['arelys', passwordHash, emailEncrypted]
                );
                console.log('✅ Usuario arelys creado en tenant market.');
            } else {
                // Actualizar password si ya existe (para asegurar que es 123)
                await db.execute('UPDATE users SET password = ? WHERE username = ?', [passwordHash, 'arelys']);
                console.log('ℹ️ Usuario arelys actualizado con contraseña 123 en tenant market.');
            }
        });

        // 2. Crear usuario Santi en tenant 'santi'
        await tenantContext.run('santi', async () => {
            console.log("Ejecutando en tenant 'santi'...");
            const emailEncrypted = encrypt('santi@market.com');
            
            // Verificar si existe
            const [users] = await db.execute('SELECT * FROM users WHERE username = ?', ['santi']);
            if (users.length === 0) {
                await db.execute(
                    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                    ['santi', passwordHash, emailEncrypted]
                );
                console.log('✅ Usuario santi creado en tenant santi.');
            } else {
                await db.execute('UPDATE users SET password = ? WHERE username = ?', [passwordHash, 'santi']);
                console.log('ℹ️ Usuario santi actualizado con contraseña 123 en tenant santi.');
            }
        });

        console.log('🎉 Seed de usuarios completado exitosamente.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error ejecutando seed:', err);
        process.exit(1);
    }
}

seedUsers();
