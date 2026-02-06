const API_URL = 'http://localhost:3000/api';

const api = {
    get: async (endpoint) => {
        try {
            const res = await fetch(`${API_URL}${endpoint}`);
            return await res.json();
        } catch (e) {
            console.error('API Error:', e);
            return { error: 'Connection Error' };
        }
    },
    post: async (endpoint, data) => {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) {
            console.error('API Error:', e);
            return { error: 'Connection Error' };
        }
    },
    delete: async (endpoint) => {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
            return await res.json();
        } catch (e) {
            console.error('API Error:', e);
            return { error: 'Connection Error' };
        }
    },
    put: async (endpoint, data) => {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) {
            console.error('API Error:', e);
            return { error: 'Connection Error' };
        }
    }
};
