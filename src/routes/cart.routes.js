const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả routes giỏ hàng yêu cầu đăng nhập
router.use(authMiddleware);

// Xem giỏ hàng
router.get('/', cartController.index);

// Thêm vào giỏ
router.post('/add', cartController.add);

// Cập nhật số lượng
router.post('/update', cartController.update);

// Xóa khỏi giỏ
router.post('/remove', cartController.remove);

module.exports = router;
