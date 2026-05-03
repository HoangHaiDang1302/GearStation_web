const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Trang đăng nhập
router.get('/login', authController.loginPage);
router.post('/login', authController.login);

// Trang đăng ký
router.get('/register', authController.registerPage);
router.post('/register', authController.register);

// Đăng xuất
router.get('/logout', authController.logout);

module.exports = router;
