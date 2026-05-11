const db = require('../config/db');

class BrandModel {
    // Lấy tất cả thương hiệu
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM brands ORDER BY name ASC');
        return rows;
    }

    // Lấy theo ID
    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM brands WHERE id = ?', [id]);
        return rows[0];
    }

    // Lấy theo slug
    static async getBySlug(slug) {
        const [rows] = await db.query('SELECT * FROM brands WHERE slug = ?', [slug]);
        return rows[0];
    }

    // Tạo thương hiệu
    static async create(data) {
        const [result] = await db.query(
            'INSERT INTO brands (name, slug, logo) VALUES (?, ?, ?)',
            [data.name, data.slug, data.logo || '']
        );
        return result.insertId;
    }

    // Cập nhật
    static async update(id, data) {
        const [result] = await db.query(
            'UPDATE brands SET name = ?, slug = ?, logo = ? WHERE id = ?',
            [data.name, data.slug, data.logo || '', id]
        );
        return result.affectedRows;
    }

    // Xóa
    static async delete(id) {
        const [result] = await db.query('DELETE FROM brands WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Đếm sản phẩm theo thương hiệu
    static async countProducts(brandId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM products WHERE brand_id = ?',
            [brandId]
        );
        return rows[0].total;
    }
}

module.exports = BrandModel;
