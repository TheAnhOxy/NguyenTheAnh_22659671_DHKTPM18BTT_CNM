const db = require('../configs/db');

const Product = {
    getAll: async (search = '') => {
        if (search) {
            const [rows] = await db.query('SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC', [`%${search}%`]);
            return rows;
        }
        const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    },
    create: async (name, price, qty) => {
        return await db.query('INSERT INTO products(name, price, quantity) VALUES (?, ?, ?)', [name, price, qty]);
    },
    update: async (id, name, price, qty) => {
        return await db.query('UPDATE products SET name=?, price=?, quantity=? WHERE id=?', [name, price, qty, id]);
    },
    delete: async (id) => {
        return await db.query('DELETE FROM products WHERE id = ?', [id]);
    }
};

module.exports = Product;