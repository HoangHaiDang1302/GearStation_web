const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminMiddleware = require('../middlewares/admin.middleware');
const upload = require('../middlewares/upload.middleware');

// Tất cả routes admin yêu cầu quyền admin
router.use(adminMiddleware);

// Dashboard
router.get('/', adminController.dashboard);

// ---- Quản lý sản phẩm ----
router.get('/products', adminController.productList);
router.get('/products/create', adminController.productCreatePage);
router.post('/products/create', upload.single('image'), adminController.productCreate);
router.get('/products/edit/:id', adminController.productEditPage);
router.post('/products/edit/:id', upload.single('image'), adminController.productUpdate);
router.post('/products/delete/:id', adminController.productDelete);

// ---- Quản lý danh mục ----
router.get('/categories', adminController.categoryList);
router.post('/categories/create', adminController.categoryCreate);
router.post('/categories/edit/:id', adminController.categoryUpdate);
router.post('/categories/delete/:id', adminController.categoryDelete);

// ---- Quản lý đơn hàng ----
router.get('/orders', adminController.orderList);
router.get('/orders/:id', adminController.orderDetail);
router.post('/orders/:id/status', adminController.orderUpdateStatus);

module.exports = router;
