const express = require('express');
const router = express.Router();

const cartApiController = require('../controllers/api/cart.api.controller');
const productApiController = require('../controllers/api/product.api.controller');
const orderApiController = require('../controllers/api/order.api.controller');
const couponApiController = require('../controllers/api/coupon.api.controller');
const adminApiController = require('../controllers/api/admin.api.controller');
const apiAuthMiddleware = require('../middlewares/api-auth.middleware');
const apiAdminMiddleware = require('../middlewares/api-admin.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'GearStation API v1',
        data: {
            public: [
                'GET /api/v1/products',
                'GET /api/v1/products/featured',
                'GET /api/v1/products/latest',
                'GET /api/v1/products/:idOrSlug',
                'GET /api/v1/products/:productId/reviews',
                'GET /api/v1/categories',
                'GET /api/v1/brands',
                'GET /api/v1/coupons/validate?code=CODE&orderAmount=AMOUNT'
            ],
            authRequired: [
                'GET /api/v1/cart',
                'POST /api/v1/cart/add',
                'PUT /api/v1/cart/update',
                'DELETE /api/v1/cart/remove',
                'GET /api/v1/orders',
                'GET /api/v1/orders/:id',
                'POST /api/v1/orders',
                'POST /api/v1/products/:productId/reviews'
            ],
            adminRequired: [
                'GET /api/v1/admin/dashboard',
                'GET /api/v1/admin/products',
                'POST /api/v1/admin/products',
                'GET /api/v1/admin/products/:id',
                'PUT /api/v1/admin/products/:id',
                'DELETE /api/v1/admin/products/:id',
                'GET /api/v1/admin/categories',
                'POST /api/v1/admin/categories',
                'PUT /api/v1/admin/categories/:id',
                'DELETE /api/v1/admin/categories/:id',
                'GET /api/v1/admin/orders',
                'GET /api/v1/admin/orders/:id',
                'PATCH /api/v1/admin/orders/:id/status',
                'GET /api/v1/admin/users'
            ]
        }
    });
});

// ============================================
// Product APIs
// ============================================
router.get('/products/featured', productApiController.featured);
router.get('/products/latest', productApiController.latest);
router.get('/products/:productId/reviews', productApiController.reviews);
router.post('/products/:productId/reviews', apiAuthMiddleware, productApiController.createReview);
router.get('/products/:idOrSlug', productApiController.detail);
router.get('/products', productApiController.list);
router.get('/categories', productApiController.categories);
router.get('/brands', productApiController.brands);

// ============================================
// Cart APIs
// ============================================
router.get('/cart', apiAuthMiddleware, cartApiController.getCart);
router.post('/cart/add', apiAuthMiddleware, cartApiController.add);
router.put('/cart/update', apiAuthMiddleware, cartApiController.update);
router.delete('/cart/remove', apiAuthMiddleware, cartApiController.remove);

// ============================================
// Order APIs
// ============================================
router.get('/orders', apiAuthMiddleware, orderApiController.list);
router.get('/orders/:id', apiAuthMiddleware, orderApiController.detail);
router.post('/orders', apiAuthMiddleware, orderApiController.create);

// ============================================
// Coupon APIs
// ============================================
router.get('/coupons/validate', couponApiController.validate);
router.post('/coupons/validate', couponApiController.validate);

// ============================================
// Admin APIs
// ============================================
router.get('/admin/dashboard', apiAdminMiddleware, adminApiController.dashboard);
router.get('/admin/products', apiAdminMiddleware, adminApiController.products);
router.post('/admin/products', apiAdminMiddleware, upload.single('image'), adminApiController.createProduct);
router.get('/admin/products/:id', apiAdminMiddleware, adminApiController.productDetail);
router.put('/admin/products/:id', apiAdminMiddleware, upload.single('image'), adminApiController.updateProduct);
router.delete('/admin/products/:id', apiAdminMiddleware, adminApiController.deleteProduct);

router.get('/admin/categories', apiAdminMiddleware, adminApiController.categories);
router.post('/admin/categories', apiAdminMiddleware, adminApiController.createCategory);
router.put('/admin/categories/:id', apiAdminMiddleware, adminApiController.updateCategory);
router.delete('/admin/categories/:id', apiAdminMiddleware, adminApiController.deleteCategory);

router.get('/admin/orders', apiAdminMiddleware, adminApiController.orders);
router.get('/admin/orders/:id', apiAdminMiddleware, adminApiController.orderDetail);
router.patch('/admin/orders/:id/status', apiAdminMiddleware, adminApiController.updateOrderStatus);

router.get('/admin/users', apiAdminMiddleware, adminApiController.users);

module.exports = router;
