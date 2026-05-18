const db = require('../config/db');

class CartModel {
    // Lấy giỏ hàng của user
    static async getByUserId(userId) {
        const [rows] = await db.query(
            `SELECT ci.*, p.name, p.price, p.sale_price, p.image, p.stock, p.slug
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.user_id = ?`,
            [userId]
        );
        return rows;
    }

    static async getItem(userId, productId) {
        const [rows] = await db.query(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return rows[0];
    }

    // Thêm sản phẩm vào giỏ
    static async addItem(userId, productId, quantity = 1) {
        // Kiểm tra đã có trong giỏ chưa
        const [existing] = await db.query(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Cập nhật số lượng
            const [result] = await db.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, userId, productId]
            );
            return result.affectedRows;
        } else {
            // Thêm mới
            const [result] = await db.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
            return result.insertId;
        }
    }

    // Cập nhật số lượng
    static async updateQuantity(userId, productId, quantity) {
        const [result] = await db.query(
            'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
        return result.affectedRows;
    }

    // Xóa 1 sản phẩm khỏi giỏ
    static async removeItem(userId, productId) {
        const [result] = await db.query(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.affectedRows;
    }

    // Xóa toàn bộ giỏ hàng (sau khi đặt hàng)
    static async clearCart(userId) {
        const [result] = await db.query(
            'DELETE FROM cart_items WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows;
    }

    // Đếm số item trong giỏ
    static async countItems(userId) {
        const [rows] = await db.query(
            'SELECT SUM(quantity) as total FROM cart_items WHERE user_id = ?',
            [userId]
        );
        return rows[0].total || 0;
    }

    // Tính tổng tiền giỏ hàng
    static async getTotal(userId) {
        const [rows] = await db.query(
            `SELECT SUM(ci.quantity * COALESCE(p.sale_price, p.price)) as total
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.user_id = ?`,
            [userId]
        );
        return rows[0].total || 0;
    }
}

module.exports = CartModel;
