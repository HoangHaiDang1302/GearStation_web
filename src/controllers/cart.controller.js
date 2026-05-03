const CartModel = require('../models/cart.model');

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

            await CartModel.addItem(userId, productId, parseInt(quantity) || 1);

            // Nếu request từ AJAX
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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

            if (parseInt(quantity) <= 0) {
                await CartModel.removeItem(userId, productId);
            } else {
                await CartModel.updateQuantity(userId, productId, parseInt(quantity));
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

            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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
