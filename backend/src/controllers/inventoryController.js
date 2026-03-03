const db = require('../config/db');

const getProducts = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos ORDER BY id DESC');
        res.status(200).json(rows);
    } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
    try {
        let { title, price, cost, stock, min_stock, categoria, proveedor_id } = req.body;

        title = title ? title.trim() : null;
        if (!title || price === undefined || price === null) {
            const err = new Error('Rechazado: Título y Precio obligatorios');
            err.status = 400; throw err;
        }

        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < 0) {
            const err = new Error('Rechazado: Formato de precio inválido');
            err.status = 400; throw err;
        }

        const [result] = await db.query(
            `INSERT INTO productos (title, price, cost, stock, min_stock, categoria, proveedor_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, numPrice, parseFloat(cost || 0), parseInt(stock || 0), parseInt(min_stock || 5), categoria || 'General', proveedor_id || null]
        );

        res.status(201).json({ id: result.insertId, title, price: numPrice, stock: parseInt(stock || 0) });
    } catch (err) { next(err); }
};

const updateProductStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validStock = parseInt(req.body.stock);

        if (isNaN(validStock)) {
            const err = new Error('Stock no es numérico o es inválido'); err.status = 400; throw err;
        }

        const [result] = await db.query(`UPDATE productos SET stock = ? WHERE id = ?`, [validStock, id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: Producto no existe'); e.status = 404; throw e; }

        res.status(200).json({ message: 'Stock actualizado con éxito' });
    } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM productos WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: El producto no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Producto eliminado por completo' });
    } catch (err) { next(err); }
};

module.exports = { getProducts, createProduct, updateProductStock, deleteProduct };
