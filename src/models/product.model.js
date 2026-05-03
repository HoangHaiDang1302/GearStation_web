const db = require('../config/db');

class ProductModel {
    // Lấy tất cả sản phẩm (có phân trang)
    static async getAll(page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    // Đếm tổng sản phẩm
    static async countAll() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM products');
        return rows[0].total;
    }

    // Lấy sản phẩm theo ID
    static async getById(id) {
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Lấy sản phẩm theo slug
    static async getBySlug(slug) {
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.slug = ?`,
            [slug]
        );
        return rows[0];
    }

    // Lấy sản phẩm theo danh mục
    static async getByCategory(categoryId, page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.category_id = ? 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`,
            [categoryId, limit, offset]
        );
        return rows;
    }

    // Đếm sản phẩm theo danh mục
    static async countByCategory(categoryId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
            [categoryId]
        );
        return rows[0].total;
    }

    // Tìm kiếm sản phẩm
    static async search(keyword, page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const searchTerm = `%${keyword}%`;
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.name LIKE ? OR p.description LIKE ? 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`,
            [searchTerm, searchTerm, limit, offset]
        );
        return rows;
    }

    // Đếm kết quả tìm kiếm
    static async countSearch(keyword) {
        const searchTerm = `%${keyword}%`;
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm]
        );
        return rows[0].total;
    }

    // Sản phẩm nổi bật
    static async getFeatured(limit = 8) {
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.is_featured = 1 
             ORDER BY p.created_at DESC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    }

    // Sản phẩm mới nhất
    static async getLatest(limit = 8) {
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             ORDER BY p.created_at DESC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    }

    // Tạo sản phẩm
    static async create(data) {
        const [result] = await db.query(
            `INSERT INTO products 
             (name, slug, description, price, sale_price, image, images, category_id, brand, stock, specifications, is_featured) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name, data.slug, data.description || '',
                data.price, data.sale_price || null,
                data.image || '', data.images || '[]',
                data.category_id, data.brand || '',
                data.stock || 0, data.specifications || '{}',
                data.is_featured || 0
            ]
        );
        return result.insertId;
    }

    // Cập nhật sản phẩm
    static async update(id, data) {
        const [result] = await db.query(
            `UPDATE products SET 
             name = ?, slug = ?, description = ?, price = ?, sale_price = ?,
             image = ?, images = ?, category_id = ?, brand = ?, 
             stock = ?, specifications = ?, is_featured = ?
             WHERE id = ?`,
            [
                data.name, data.slug, data.description,
                data.price, data.sale_price,
                data.image, data.images,
                data.category_id, data.brand,
                data.stock, data.specifications, data.is_featured,
                id
            ]
        );
        return result.affectedRows;
    }

    // Cập nhật tồn kho
    static async updateStock(id, quantity) {
        const [result] = await db.query(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
            [quantity, id, quantity]
        );
        return result.affectedRows;
    }

    // Xóa sản phẩm
    static async delete(id) {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ProductModel;
