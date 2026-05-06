/**
 * services/messenger.js
 * Servicio para el envío de mensajes integrando la API de WhatsApp (Simulado).
 * Gestiona plantillas de mensajes y aislamiento de configuración por tenant.
 */
const fs = require('fs');
const path = require('path');
const db = require('../config/db'); // Contains tenantContext
const configPath = path.join(__dirname, '../../config.json');
let configData = {};

try {
    configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error("Error reading config.json for messenger", error);
}

/**
 * Clase que maneja el envío de notificaciones.
 */
class MessengerService {
    /**
     * Envía un mensaje a través de la API de WhatsApp (Simulada).
     *
     * Este método formatea el texto del mensaje dependiendo del `type`
     * (e.g., 'remind-appointment' o 'contact-provider') y simula el
     * consumo de la Cloud API usando la configuración aislada por tenant.
     *
     * @async
     * @param {string} type - Identificador de la plantilla o tipo de mensaje ('remind-appointment' | 'contact-provider').
     * @param {Object} data - Datos dinámicos para rellenar la plantilla.
     * @param {string} [data.client] - Nombre del cliente (para recordatorios).
     * @param {string} [data.date] - Fecha de la cita (para recordatorios).
     * @param {string} [data.providerName] - Nombre del proveedor (para pedidos).
     * @param {string} [data.productName] - Nombre del producto a pedir (para pedidos).
     * @returns {Promise<{success: boolean, message?: string, error?: string}>} Resultado de la operación de envío.
     */
    async sendMessage(type, data) {
        // Enforce the tenant context correctly isolating the configuration
        const tenant = db.tenantContext.getStore() || 'market';
        const tenantConfig = configData[tenant];

        if (!tenantConfig || !tenantConfig.whatsapp) {
            console.error(`[WhatsApp API] Tenant ${tenant} is missing WhatsApp configuration.`);
            return { success: false, error: 'Configuración no encontrada.' };
        }

        const { token, phoneId } = tenantConfig.whatsapp;
        let messageText = '';

        // Template Selection Logic based on the user request restrictions
        if (type === 'remind-appointment') {
            const { client, date } = data;
            messageText = `Hola ${client}, te recordamos tu cita en Oh-Nails para el ${date}. ¡Te esperamos!`;
        } else if (type === 'contact-provider') {
            const { providerName, productName } = data;
            messageText = `Hola Proveedor ${providerName}, solicitamos reponer stock de ${productName || 'nuestros suministros'}. Gracias, El Gallo Azul.`;
        } else {
            return { success: false, error: 'Tipo de mensaje desconocido.' };
        }

        // WhatsApp Cloud API Mock Execution (Isolated securely)
        console.log(`\n============================`);
        console.log(`📡 [WhatsApp API Triggered]`);
        console.log(`🔐 Context: Tenant [${tenant}]`);
        console.log(`🆔 Phone ID Source: ${phoneId}`);
        console.log(`🔑 Used Token: ${token}`);
        console.log(`✉️ Message Template Payload:\n"${messageText}"`);
        console.log(`============================\n`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return { success: true, message: `Mensaje de WhatsApp enviado a través de la plantilla: ${type}` };
    }
}

module.exports = new MessengerService();
