const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Tìm kiếm sản phẩm
router.get('/search', productController.search);

// Sản phẩm theo danh mục
router.get('/category/:slug', productController.byCategory);

// Danh sách tất cả sản phẩm
router.get('/', productController.index);

// Chi tiết sản phẩm (đặt cuối để không conflict với routes khác)
router.get('/:slug', productController.detail);

module.exports = router;
