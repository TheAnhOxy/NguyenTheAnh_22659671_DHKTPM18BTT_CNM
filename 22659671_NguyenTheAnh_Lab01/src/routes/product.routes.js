const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.renderHomePage);
router.get('/add', productController.renderForm);
router.get('/edit/:id', productController.renderForm);
router.post('/save', productController.saveProduct);
router.get('/delete/:id', productController.deleteProduct);

module.exports = router;