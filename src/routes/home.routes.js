const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

// GET / - Trang chủ
router.get('/', homeController.index);

module.exports = router;
