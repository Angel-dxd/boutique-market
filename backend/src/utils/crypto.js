/**
 * utils/crypto.js
 * Utilidades de cifrado simétrico (AES-256-CBC) para proteger datos sensibles.
 */
const crypto = require('crypto');

// ─── Validación de clave al arranque ─────────────────────────────────────────
// La clave DEBE venir del entorno. Sin ella el servidor no arranca.
// Compatibilidad: aceptar ENCRYPTION_KEY (preferido) o CRYPTO_KEY (legado).
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.CRYPTO_KEY;
const IV_LENGTH = 16; // AES siempre usa bloques de 16 bytes

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    console.error('\n❌ [CRYPTO] ENCRYPTION_KEY/CRYPTO_KEY no definida o insuficiente (mínimo 32 caracteres).');
    console.error('   Añade ENCRYPTION_KEY=<clave_de_32_chars> a tu archivo /backend/.env\n');
    process.exit(1); // Detiene el servidor — no hay cifrado sin clave
}

/**
 * Cifra un texto plano usando AES-256-CBC.
 * Genera un IV aleatorio por cada cifrado para garantizar
 * que el mismo valor producirá textos cifrados distintos.
 * (Cumple PSyP-4 del TFG)
 *
 * @param {string} text - Texto a cifrar (ej: email del cliente)
 * @returns {string} - "iv_hex:encrypted_hex"
 */
function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Descifra un texto previamente cifrado con encrypt().
 *
 * @param {string} text - "iv_hex:encrypted_hex"
 * @returns {string} - Texto original descifrado
 */
function decrypt(text) {
    if (!text) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };