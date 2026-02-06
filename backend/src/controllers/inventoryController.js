const supabase = require('../config/supabase');

const getProducts = async (req, res) => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const createProduct = async (req, res) => {
    const { title, price, cost, stock, min_stock, categoria, proveedor_id } = req.body;

    // Basic Validation
    if (!title || !price) {
        return res.status(400).json({ error: 'Nombre y Precio son obligatorios' });
    }

    const { data, error } = await supabase.from('productos').insert([{
        title,
        price: parseFloat(price),
        cost: parseFloat(cost || 0),
        stock: parseInt(stock || 0),
        min_stock: parseInt(min_stock || 5),
        categoria: categoria || 'General',
        proveedor_id: proveedor_id || null
    }]).select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
};

const updateProductStock = async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    const { data, error } = await supabase
        .from('productos')
        .update({ stock: parseInt(stock) })
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Producto eliminado' });
};

module.exports = { getProducts, createProduct, updateProductStock, deleteProduct };
