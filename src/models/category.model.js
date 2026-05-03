const db = require('../config/db');

class CategoryModel {
    // Lấy tất cả danh mục
    static async getAll() {
        const [rows] = await db.query(
            'SELECT * FROM categories ORDER BY name ASC'
        );
        return rows;
    }

    // Lấy danh mục theo ID
    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    }

    // Lấy danh mục theo slug
    static async getBySlug(slug) {
        const [rows] = await db.query('SELECT * FROM categories WHERE slug = ?', [slug]);
        return rows[0];
    }

    // Tạo danh mục
    static async create(data) {
        const [result] = await db.query(
            'INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)',
            [data.name, data.slug, data.description || '', data.image || '']
        );
        return result.insertId;
    }

    // Cập nhật danh mục
    static async update(id, data) {
        const [result] = await db.query(
            'UPDATE categories SET name = ?, slug = ?, description = ?, image = ? WHERE id = ?',
            [data.name, data.slug, data.description, data.image, id]
        );
        return result.affectedRows;
    }

    // Xóa danh mục
    static async delete(id) {
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Đếm sản phẩm theo danh mục
    static async countProducts(categoryId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
            [categoryId]
        );
        return rows[0].total;
    }
}

module.exports = CategoryModel;
