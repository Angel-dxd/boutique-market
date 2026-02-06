const supabase = require('../config/supabase');

const getProviders = async (req, res) => {
    const { data, error } = await supabase.from('proveedores').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const createProvider = async (req, res) => {
    const { nombre, telefono, empresa, categoria } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'Nombre es obligatorio' });
    }

    const { data, error } = await supabase.from('proveedores').insert([{
        nombre, telefono, empresa, categoria: categoria || 'Suministros'
    }]).select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
};

const bulkCreateProviders = async (req, res) => {
    const { providers } = req.body; // Expects array

    if (!Array.isArray(providers) || providers.length === 0) {
        return res.status(400).json({ error: 'Lista de proveedores inválida' });
    }

    // Basic Validation per item could go here
    const validProviders = providers.filter(p => p.nombre);

    const { data, error } = await supabase.from('proveedores').insert(validProviders).select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Importación exitosa', count: data.length });
};

const deleteProvider = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Proveedor eliminado' });
};

module.exports = { getProviders, createProvider, bulkCreateProviders, deleteProvider };
