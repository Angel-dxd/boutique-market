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

class MessengerService {
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
