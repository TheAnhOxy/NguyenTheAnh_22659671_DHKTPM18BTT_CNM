const Product = require('../models/product.model');

exports.renderHomePage = async (req, res) => {
    try {
        const search = req.query.search || ''; 
        const products = await Product.getAll(search);
        res.render('products', { products, search }); 
    } catch (error) {
        res.status(500).send("Lỗi MariaDB: " + error.message);
    }
};

exports.renderForm = async (req, res) => {
    try {
        const id = req.params.id;
        let product = null;
        if (id) {
            product = await Product.getById(id);
        }
        res.render('form', { product });
    } catch (error) {
        res.status(500).send("Lỗi hiển thị form");
    }
};

exports.saveProduct = async (req, res) => {
    try {
        const { id, name, price, quantity } = req.body;
        if (id) {
            await Product.update(id, name, price, quantity);
        } else {
            await Product.create(name, price, quantity);
        }
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Lỗi lưu dữ liệu");
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        await Product.delete(req.params.id);
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Lỗi xóa");
    }
};