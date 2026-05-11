const db = require('../config/db');

class CouponModel {
    // Lấy tất cả mã giảm giá
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
        return rows;
    }

    // Lấy theo ID
    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM coupons WHERE id = ?', [id]);
        return rows[0];
    }

    // Tìm theo mã code (kiểm tra hợp lệ)
    static async getByCode(code) {
        const [rows] = await db.query(
            `SELECT * FROM coupons 
             WHERE code = ? 
             AND is_active = 1 
             AND start_date <= NOW() 
             AND end_date >= NOW() 
             AND (usage_limit IS NULL OR used_count < usage_limit)`,
            [code]
        );
        return rows[0];
    }

    // Tính số tiền giảm
    static calculateDiscount(coupon, orderAmount) {
        if (!coupon) return 0;
        if (orderAmount < coupon.min_order_amount) return 0;

        let discount = 0;
        if (coupon.discount_type === 'percent') {
            discount = Math.floor(orderAmount * coupon.discount_value / 100);
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else {
            discount = coupon.discount_value;
        }
        return discount;
    }

    // Tạo mã giảm giá
    static async create(data) {
        const [result] = await db.query(
            `INSERT INTO coupons 
             (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, start_date, end_date, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.code.toUpperCase(), data.discount_type,
                data.discount_value, data.min_order_amount || 0,
                data.max_discount || null, data.usage_limit || null,
                data.start_date, data.end_date,
                data.is_active !== undefined ? data.is_active : 1
            ]
        );
        return result.insertId;
    }

    // Cập nhật
    static async update(id, data) {
        const [result] = await db.query(
            `UPDATE coupons SET 
             code = ?, discount_type = ?, discount_value = ?, 
             min_order_amount = ?, max_discount = ?, usage_limit = ?,
             start_date = ?, end_date = ?, is_active = ?
             WHERE id = ?`,
            [
                data.code.toUpperCase(), data.discount_type,
                data.discount_value, data.min_order_amount,
                data.max_discount, data.usage_limit,
                data.start_date, data.end_date, data.is_active,
                id
            ]
        );
        return result.affectedRows;
    }

    // Xóa
    static async delete(id) {
        const [result] = await db.query('DELETE FROM coupons WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Tăng số lần sử dụng
    static async incrementUsage(id) {
        await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [id]);
    }
}

module.exports = CouponModel;
