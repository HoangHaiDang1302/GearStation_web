const OrderModel = require('../../models/order.model');
const CartModel = require('../../models/cart.model');
const CouponModel = require('../../models/coupon.model');

class OrderApiController {
    async list(req, res) {
        try {
            const userId = req.session.user.id;
            const orders = await OrderModel.getByUserId(userId);

            return res.json({
                success: true,
                data: { orders }
            });
        } catch (error) {
            console.error('Order list API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async detail(req, res) {
        try {
            const userId = req.session.user.id;
            const order = await OrderModel.getById(req.params.id);

            if (!order || order.user_id !== userId) {
                return res.status(404).json({ success: false, message: 'Khong tim thay don hang' });
            }

            const items = await OrderModel.getItems(order.id);

            return res.json({
                success: true,
                data: { order, items }
            });
        } catch (error) {
            console.error('Order detail API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async create(req, res) {
        try {
            const userId = req.session.user.id;
            const {
                shipping_name,
                shipping_phone,
                shipping_address,
                note,
                payment_method,
                coupon_code
            } = req.body;

            if (!shipping_name || !shipping_phone || !shipping_address) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui long nhap day du thong tin giao hang'
                });
            }

            const cartItems = await CartModel.getByUserId(userId);
            if (cartItems.length === 0) {
                return res.status(400).json({ success: false, message: 'Gio hang dang trong' });
            }

            const total = await CartModel.getTotal(userId);
            const invalidStockItem = cartItems.find(item => item.quantity > item.stock);
            if (invalidStockItem) {
                return res.status(400).json({
                    success: false,
                    message: `San pham "${invalidStockItem.name}" chi con ${invalidStockItem.stock} trong kho`
                });
            }

            const couponCode = (coupon_code || '').trim().toUpperCase();
            let coupon = null;
            let discount = 0;
            if (couponCode) {
                coupon = await CouponModel.getByCode(couponCode);
                discount = Number(CouponModel.calculateDiscount(coupon, total));

                if (!coupon || discount <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ma giam gia khong hop le hoac chua du dieu kien ap dung'
                    });
                }
            }

            const finalAmount = Math.max(total - discount, 0);
            const orderData = {
                user_id: userId,
                total_amount: total,
                discount_amount: discount,
                final_amount: finalAmount,
                shipping_name,
                shipping_phone,
                shipping_address,
                note: note || '',
                coupon_id: coupon ? coupon.id : null,
                payment_method: payment_method || 'cod'
            };

            const items = cartItems.map((item) => ({
                product_id: item.product_id,
                product_name: item.name,
                product_image: item.image || '',
                price: item.sale_price || item.price,
                quantity: item.quantity
            }));

            const orderId = await OrderModel.create(orderData, items);
            await CartModel.clearCart(userId);

            return res.status(201).json({
                success: true,
                message: 'Dat hang thanh cong',
                data: { orderId }
            });
        } catch (error) {
            console.error('Create order API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }
}

module.exports = new OrderApiController();
