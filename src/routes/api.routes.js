const express = require('express');
const router = express.Router();

const cartApiController = require('../controllers/api/cart.api.controller');

// ============================================
// Cart APIs
// ============================================
router.get('/cart', cartApiController.getCart);
router.post('/cart/add', cartApiController.add);
router.put('/cart/update', cartApiController.update);
router.delete('/cart/remove', cartApiController.remove);

module.exports = router;
