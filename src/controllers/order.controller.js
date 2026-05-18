const OrderModel = require('../models/order.model');
const CartModel = require('../models/cart.model');
const CouponModel = require('../models/coupon.model');

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
                discount: 0,
                finalAmount: total,
                couponCode: '',
                error: null,
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
            const { shipping_name, shipping_phone, shipping_address, note, payment_method } = req.body;
            const couponCode = (req.body.coupon_code || '').trim().toUpperCase();

            // Lấy giỏ hàng
            const cartItems = await CartModel.getByUserId(userId);
            if (cartItems.length === 0) {
                return res.redirect('/cart');
            }

            const total = await CartModel.getTotal(userId);
            const invalidStockItem = cartItems.find(item => item.quantity > item.stock);
            if (invalidStockItem) {
                return res.render('orders/checkout', {
                    title: 'Thanh toÃ¡n',
                    items: cartItems,
                    total,
                    discount: 0,
                    finalAmount: total,
                    couponCode,
                    error: `Sáº£n pháº©m "${invalidStockItem.name}" chá»‰ cÃ²n ${invalidStockItem.stock} trong kho`,
                    user: req.session.user
                });
            }

            let coupon = null;
            let discount = 0;
            if (couponCode) {
                coupon = await CouponModel.getByCode(couponCode);
                discount = Number(CouponModel.calculateDiscount(coupon, total));

                if (!coupon || discount <= 0) {
                    return res.render('orders/checkout', {
                        title: 'Thanh toÃ¡n',
                        items: cartItems,
                        total,
                        discount: 0,
                        finalAmount: total,
                        couponCode,
                        error: 'MÃ£ giáº£m giÃ¡ khÃ´ng há»£p lá»‡ hoáº·c chÆ°a Ä‘á»§ Ä‘iá»u kiá»‡n Ã¡p dá»¥ng',
                        user: req.session.user
                    });
                }
            }

            const finalAmount = Math.max(total - discount, 0);

            // Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                user_id: userId,
                total_amount: total,
                discount_amount: discount,
                final_amount: finalAmount,
                shipping_name,
                shipping_phone,
                shipping_address,
                note,
                coupon_id: coupon ? coupon.id : null,
                payment_method: payment_method || 'cod'
            };

            const items = cartItems.map(item => ({
                product_id: item.product_id,
                product_name: item.name,
                product_image: item.image || '',
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
