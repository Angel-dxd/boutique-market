/**
 * Utility to parse CSV files related to Booksy or Generic Financial Data.
 * Expected Booksy/Generic columns: 'Date', 'Time', 'Client', 'Service', 'Price'/'Amount'
 */
export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const rows = text.split('\n').map(row => row.split(','));

                if (rows.length < 2) {
                    return resolve({ data: [], error: 'Archivo vacío o formato incorrecto' });
                }

                // Basic Cleanup and Header detection
                const headers = rows[0].map(h => h.trim().toLowerCase().replace(/"/g, ''));

                const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('fecha'));
                const descIdx = headers.findIndex(h => h.includes('service') || h.includes('servicio') || h.includes('description') || h.includes('descripción'));
                const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('precio') || h.includes('amount') || h.includes('monto'));
                const clientIdx = headers.findIndex(h => h.includes('client') || h.includes('cliente'));

                const transactions = rows.slice(1)
                    .filter(r => r.length > 1 && r.join('').trim() !== '')
                    .map((row) => {
                        // Safe Access
                        const safeGet = (idx) => idx !== -1 && row[idx] ? row[idx].replace(/"/g, '').trim() : '';

                        const rawDate = safeGet(dateIdx);
                        const description = safeGet(descIdx) || 'Importación CSV';
                        const client = safeGet(clientIdx);
                        const rawPrice = safeGet(priceIdx).replace(/[^0-9.-]/g, ''); // Remove currency symbols

                        // Parse Date (Assuming ISO or localized... kept simple for MVP)
                        // Ideally use date-fns or moment, trying native parsing:
                        let dateObj = new Date(rawDate);
                        if (isNaN(dateObj.getTime())) {
                            // Fallback for DD/MM/YYYY
                            const parts = rawDate.split('/');
                            if (parts.length === 3) dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                            if (isNaN(dateObj.getTime())) dateObj = new Date(); // Fallback to today
                        }
                        const formattedDate = dateObj.toISOString().split('T')[0];

                        return {
                            date: formattedDate,
                            category: 'Cobros Booksy', // Default for imports
                            amount: parseFloat(rawPrice) || 0,
                            type: 'income',
                            description: client ? `${description} - ${client}` : description,
                            client_name: client // Helper for future linking
                        };
                    });

                resolve({ data: transactions, count: transactions.length });
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
};
