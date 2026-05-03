const OrderModel = require('../models/order.model');
const CartModel = require('../models/cart.model');

class OrderController {
    // [GET] /checkout - Trang thanh toán
    async checkoutPage(req, res, next) {
        try {
            const userId = req.session.user.id;
            const items = await CartModel.getByUserId(userId);
            const total = await CartModel.getTotal(userId);

            if (items.length === 0) {
                return res.redirect('/cart');
            }

            res.render('orders/checkout', {
                title: 'Thanh toán',
                items,
                total,
                user: req.session.user
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /checkout - Xử lý đặt hàng
    async placeOrder(req, res, next) {
        try {
            const userId = req.session.user.id;
            const { shipping_name, shipping_phone, shipping_address, note } = req.body;

            // Lấy giỏ hàng
            const cartItems = await CartModel.getByUserId(userId);
            if (cartItems.length === 0) {
                return res.redirect('/cart');
            }

            const total = await CartModel.getTotal(userId);

            // Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                user_id: userId,
                total_amount: total,
                shipping_name,
                shipping_phone,
                shipping_address,
                note
            };

            const items = cartItems.map(item => ({
                product_id: item.product_id,
                product_name: item.name,
                price: item.sale_price || item.price,
                quantity: item.quantity
            }));

            // Tạo đơn hàng
            const orderId = await OrderModel.create(orderData, items);

            // Xóa giỏ hàng
            await CartModel.clearCart(userId);

            res.render('orders/success', {
                title: 'Đặt hàng thành công',
                orderId
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /orders - Lịch sử đơn hàng
    async history(req, res, next) {
        try {
            const userId = req.session.user.id;
            const orders = await OrderModel.getByUserId(userId);

            res.render('orders/history', {
                title: 'Đơn hàng của tôi',
                orders
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /orders/:id - Chi tiết đơn hàng
    async detail(req, res, next) {
        try {
            const userId = req.session.user.id;
            const order = await OrderModel.getById(req.params.id);

            if (!order || order.user_id !== userId) {
                return res.status(404).render('errors/404', { title: 'Không tìm thấy đơn hàng' });
            }

            const items = await OrderModel.getItems(order.id);

            res.render('orders/detail', {
                title: `Đơn hàng #${order.id}`,
                order,
                items
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();
