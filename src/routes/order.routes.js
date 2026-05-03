const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả routes đơn hàng yêu cầu đăng nhập
router.use(authMiddleware);

// Trang thanh toán
router.get('/checkout', orderController.checkoutPage);
router.post('/checkout', orderController.placeOrder);

// Lịch sử đơn hàng
router.get('/', orderController.history);

// Chi tiết đơn hàng
router.get('/:id', orderController.detail);

module.exports = router;
