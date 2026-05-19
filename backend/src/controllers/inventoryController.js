/**
 * controllers/inventoryController.js
 * Gestión de inventario para el módulo de Market.
 * Maneja productos, stock, precios y proveedores asociados.
 */
const db = require('../config/db');

/**
 * Obtiene la lista de productos del inventario con paginación.
 *
 * @async
 * @function getProducts
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de consulta para paginación.
 * @param {string|number} [req.query.page=1] - Página actual.
 * @param {string|number} [req.query.limit=50] - Cantidad de productos por página.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con los datos paginados (`data`, `total`, `page`, `limit`, `totalPages`).
 */
const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 
        const offset = (page - 1) * limit;

        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM inventory');
        const [rows] = await db.query('SELECT * FROM inventory ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
        
        res.status(200).json({
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) { next(err); }
};

/**
 * Crea un nuevo producto en el inventario.
 *
 * @async
 * @function createProduct
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.title - Título o nombre del producto.
 * @param {number|string} req.body.price - Precio de venta al público.
 * @param {number|string} [req.body.cost] - Costo de adquisición.
 * @param {number|string} [req.body.stock] - Cantidad inicial en stock.
 * @param {number|string} [req.body.min_stock] - Stock mínimo (alerta de reabastecimiento).
 * @param {string} [req.body.category] - Categoría del producto.
 * @param {number|string} [req.body.provider_id] - ID del proveedor asociado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con los datos básicos del producto creado.
 */
const createProduct = async (req, res, next) => {
    try {
        let { title, price, cost, stock, min_stock, category, provider_id, expiration_date } = req.body;
 
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
            `INSERT INTO inventory (title, price, cost, stock, min_stock, category, provider_id, expiration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, numPrice, parseFloat(cost || 0), parseInt(stock || 0), parseInt(min_stock || 5), category || 'General', provider_id || null, expiration_date || null]
        );
 
        res.status(201).json({ id: result.insertId, title, price: numPrice, stock: parseInt(stock || 0) });
    } catch (err) { next(err); }
};
 
/**
 * Actualiza únicamente la cantidad de stock de un producto.
 *
 * @async
 * @function updateProductStock
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador del producto.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {number|string} req.body.stock - Nueva cantidad de stock.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un mensaje confirmando la actualización del stock.
 */
const updateProductStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validStock = parseInt(req.body.stock);
 
        if (isNaN(validStock)) {
            const err = new Error('Stock no es numérico o es inválido'); err.status = 400; throw err;
        }
 
        const [result] = await db.query(`UPDATE inventory SET stock = ? WHERE id = ?`, [validStock, id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: Producto no existe'); e.status = 404; throw e; }
 
        res.status(200).json({ message: 'Stock actualizado con éxito' });
    } catch (err) { next(err); }
};
 
/**
 * Elimina un producto del inventario de forma permanente.
 *
 * @async
 * @function deleteProduct
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador del producto a eliminar.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un mensaje confirmando la eliminación o error 404.
 */
const deleteProduct = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM inventory WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: El producto no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Producto eliminado por completo' });
    } catch (err) { next(err); }
};
 
/**
 * Actualiza todos los datos de un producto existente.
 *
 * @async
 * @function updateProduct
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador del producto.
 * @param {Object} req.body - Cuerpo de la petición con los nuevos datos.
 * @param {string} req.body.title - Título o nombre actualizado.
 * @param {number|string} req.body.price - Precio de venta actualizado.
 * @param {number|string} [req.body.cost] - Costo actualizado.
 * @param {number|string} [req.body.stock] - Stock actualizado.
 * @param {number|string} [req.body.min_stock] - Stock mínimo actualizado.
 * @param {string} [req.body.category] - Categoría actualizada.
 * @param {number|string} [req.body.provider_id] - ID del proveedor asociado actualizado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un mensaje confirmando la actualización del producto.
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, price, cost, stock, min_stock, category, provider_id, expiration_date } = req.body;
 
        if (!title || price === undefined) {
            const err = new Error('Rechazado: Título y Precio obligatorios');
            err.status = 400; throw err;
        }
 
        const [result] = await db.query(
            `UPDATE inventory SET title=?, price=?, cost=?, stock=?, min_stock=?, category=?, provider_id=?, expiration_date=? WHERE id=?`,
            [title.trim(), parseFloat(price), parseFloat(cost || 0), parseInt(stock || 0), parseInt(min_stock || 5), category || 'General', provider_id || null, expiration_date || null, id]
        );
        if (result.affectedRows === 0) { const e = new Error('Rechazado: El producto no existe'); e.status = 404; throw e; }
 
        res.status(200).json({ message: 'Producto actualizado por completo' });
    } catch (err) { next(err); }
};

/**
 * Obtiene la lista de productos que están próximos a vencer o vencidos (menos de 30 días).
 *
 * @async
 * @function getCaducityAlerts
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con los productos próximos a caducar.
 */
const getCaducityAlerts = async (req, res, next) => {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        const formattedDate = thirtyDaysLater.toISOString().slice(0, 10);
        
        const [rows] = await db.query(
            "SELECT * FROM inventory WHERE expiration_date IS NOT NULL AND expiration_date <= ? ORDER BY expiration_date ASC",
            [formattedDate]
        );
        res.status(200).json(rows);
    } catch (err) { next(err); }
};
 
module.exports = { getProducts, createProduct, updateProductStock, updateProduct, deleteProduct, getCaducityAlerts };
