const db = require('../config/db');

class ReviewModel {
    // Lấy đánh giá theo sản phẩm
    static async getByProductId(productId) {
        const [rows] = await db.query(
            `SELECT r.*, u.username, u.fullname 
             FROM reviews r 
             LEFT JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = ? 
             ORDER BY r.created_at DESC`,
            [productId]
        );
        return rows;
    }

    // Lấy điểm trung bình và số lượng đánh giá
    static async getStats(productId) {
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) as total_reviews, 
                ROUND(AVG(rating), 1) as avg_rating 
             FROM reviews 
             WHERE product_id = ?`,
            [productId]
        );
        return rows[0];
    }

    // Kiểm tra user đã đánh giá sản phẩm chưa
    static async hasReviewed(productId, userId) {
        const [rows] = await db.query(
            'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
            [productId, userId]
        );
        return rows.length > 0;
    }

    // Tạo đánh giá
    static async create(data) {
        const [result] = await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [data.product_id, data.user_id, data.rating, data.comment || '']
        );
        return result.insertId;
    }

    // Cập nhật đánh giá
    static async update(id, userId, data) {
        const [result] = await db.query(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?',
            [data.rating, data.comment, id, userId]
        );
        return result.affectedRows;
    }

    // Xóa đánh giá
    static async delete(id, userId) {
        const [result] = await db.query(
            'DELETE FROM reviews WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows;
    }

    // Lấy tất cả đánh giá (admin)
    static async getAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [rows] = await db.query(
            `SELECT r.*, u.username, p.name as product_name 
             FROM reviews r 
             LEFT JOIN users u ON r.user_id = u.id 
             LEFT JOIN products p ON r.product_id = p.id 
             ORDER BY r.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }
}

module.exports = ReviewModel;
