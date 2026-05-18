const CouponModel = require('../../models/coupon.model');

class CouponApiController {
    async validate(req, res) {
        try {
            const code = (req.body.code || req.query.code || '').trim().toUpperCase();
            const orderAmount = Number(req.body.orderAmount || req.query.orderAmount || 0);

            if (!code) {
                return res.status(400).json({ success: false, message: 'Vui long nhap ma giam gia' });
            }

            if (!Number.isFinite(orderAmount) || orderAmount < 0) {
                return res.status(400).json({ success: false, message: 'Gia tri don hang khong hop le' });
            }

            const coupon = await CouponModel.getByCode(code);
            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Ma giam gia khong hop le hoac da het han' });
            }

            const discount = Number(CouponModel.calculateDiscount(coupon, orderAmount));
            if (discount <= 0 && orderAmount < coupon.min_order_amount) {
                return res.status(400).json({
                    success: false,
                    message: `Don hang toi thieu ${Number(coupon.min_order_amount).toLocaleString('vi-VN')} VND`
                });
            }

            return res.json({
                success: true,
                message: 'Ma giam gia hop le',
                data: {
                    coupon: {
                        id: coupon.id,
                        code: coupon.code,
                        discount_type: coupon.discount_type,
                        discount_value: coupon.discount_value,
                        min_order_amount: coupon.min_order_amount,
                        max_discount: coupon.max_discount
                    },
                    orderAmount,
                    discount,
                    finalAmount: Math.max(orderAmount - discount, 0)
                }
            });
        } catch (error) {
            console.error('Coupon validate API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }
}

module.exports = new CouponApiController();
