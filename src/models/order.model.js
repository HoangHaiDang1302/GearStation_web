const db = require('../config/db');

class OrderModel {
    // Lấy tất cả đơn hàng (admin)
    static async getAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [rows] = await db.query(
            `SELECT o.*, u.fullname, u.email, u.phone 
             FROM orders o 
             LEFT JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    // Đếm tổng đơn hàng
    static async countAll() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM orders');
        return rows[0].total;
    }

    // Lấy đơn hàng theo ID
    static async getById(id) {
        const [rows] = await db.query(
            `SELECT o.*, u.fullname, u.email, u.phone 
             FROM orders o 
             LEFT JOIN users u ON o.user_id = u.id 
             WHERE o.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Lấy đơn hàng theo user
    static async getByUserId(userId) {
        const [rows] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }

    // Tạo đơn hàng mới (sử dụng transaction)
    static async create(orderData, items) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Tạo đơn hàng
            const [orderResult] = await connection.query(
                `INSERT INTO orders 
                 (user_id, total_amount, discount_amount, shipping_fee, final_amount,
                  shipping_address, shipping_phone, shipping_name, note, 
                  coupon_id, payment_method, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderData.user_id, orderData.total_amount,
                    orderData.discount_amount || 0,
                    orderData.shipping_fee || 0,
                    orderData.final_amount || orderData.total_amount,
                    orderData.shipping_address, orderData.shipping_phone,
                    orderData.shipping_name, orderData.note || '',
                    orderData.coupon_id || null,
                    orderData.payment_method || 'cod',
                    'pending'
                ]
            );

            const orderId = orderResult.insertId;

            // Thêm các sản phẩm vào đơn hàng
            for (const item of items) {
                await connection.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.product_name, item.product_image || '', item.price, item.quantity]
                );

                // Giảm tồn kho + tăng số lượng đã bán
                await connection.query(
                    'UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ? AND stock >= ?',
                    [item.quantity, item.quantity, item.product_id, item.quantity]
                );
            }

            // Tăng used_count của coupon nếu có
            if (orderData.coupon_id) {
                await connection.query(
                    'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
                    [orderData.coupon_id]
                );
            }

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Cập nhật trạng thái đơn hàng
    static async updateStatus(id, status) {
        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    }

    // Lấy chi tiết đơn hàng (các sản phẩm)
    static async getItems(orderId) {
        const [rows] = await db.query(
            `SELECT oi.*, p.image, p.slug 
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [orderId]
        );
        return rows;
    }

    // Thống kê doanh thu (admin)
    static async getRevenue(startDate, endDate) {
        const [rows] = await db.query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as total_orders,
                SUM(final_amount) as revenue
             FROM orders 
             WHERE status != 'cancelled' 
             AND created_at BETWEEN ? AND ?
             GROUP BY DATE(created_at)
             ORDER BY date DESC`,
            [startDate, endDate]
        );
        return rows;
    }

    // Thống kê tổng quan (admin dashboard)
    static async getStats() {
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status = 'delivered' THEN final_amount ELSE 0 END) as total_revenue
             FROM orders`
        );
        return rows[0];
    }
}

module.exports = OrderModel;
