const CartModel = require('../models/cart.model');
const ProductModel = require('../models/product.model');

class CartController {
    // [GET] /cart - Xem giỏ hàng
    async index(req, res, next) {
        try {
            const userId = req.session.user.id;
            const items = await CartModel.getByUserId(userId);
            const total = await CartModel.getTotal(userId);

            res.render('cart/index', {
                title: 'Giỏ hàng',
                items,
                total
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /cart/add - Thêm vào giỏ hàng
    async add(req, res, next) {
        try {
            const userId = req.session.user.id;
            const { productId, quantity } = req.body;
            const wantsJson = req.xhr || (req.headers.accept || '').includes('json');
            const addQuantity = parseInt(quantity, 10) || 1;
            const product = await ProductModel.getById(productId);
            const cartItem = await CartModel.getItem(userId, productId);

            if (!product) {
                return res.status(404).render('errors/404', { title: 'Khong tim thay san pham' });
            }

            if (addQuantity <= 0 || (cartItem ? cartItem.quantity : 0) + addQuantity > product.stock) {
                if (wantsJson) {
                    return res.status(400).json({ success: false, message: `San pham chi con ${product.stock} trong kho` });
                }
                return res.redirect(`/products/${product.slug}`);
            }

            await CartModel.addItem(userId, productId, addQuantity);

            // Nếu request từ AJAX
            if (wantsJson) {
                const cartCount = await CartModel.countItems(userId);
                return res.json({ success: true, cartCount });
            }

            res.redirect('/cart');
        } catch (error) {
            next(error);
        }
    }

    // [POST] /cart/update - Cập nhật số lượng
    async update(req, res, next) {
        try {
            const userId = req.session.user.id;
            const { productId, quantity } = req.body;
            const nextQuantity = parseInt(quantity, 10);

            if (nextQuantity <= 0) {
                await CartModel.removeItem(userId, productId);
            } else {
                const product = await ProductModel.getById(productId);
                if (!product || nextQuantity > product.stock) {
                    return res.redirect('/cart');
                }
                await CartModel.updateQuantity(userId, productId, nextQuantity);
            }

            res.redirect('/cart');
        } catch (error) {
            next(error);
        }
    }

    // [POST] /cart/remove - Xóa sản phẩm khỏi giỏ
    async remove(req, res, next) {
        try {
            const userId = req.session.user.id;
            const { productId } = req.body;

            await CartModel.removeItem(userId, productId);

            if (req.xhr || (req.headers.accept || '').includes('json')) {
                const cartCount = await CartModel.countItems(userId);
                return res.json({ success: true, cartCount });
            }

            res.redirect('/cart');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CartController();
