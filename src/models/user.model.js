const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
    // Lấy tất cả users
    static async getAll() {
        const [rows] = await db.query(
            'SELECT id, username, email, fullname, phone, address, role, created_at FROM users'
        );
        return rows;
    }

    // Tìm user theo ID
    static async getById(id) {
        const [rows] = await db.query(
            'SELECT id, username, email, fullname, phone, address, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Tìm user theo email
    static async getByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Tìm user theo username
    static async getByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    // Tạo user mới
    static async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, fullname, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.username, data.email, hashedPassword, data.fullname || '', data.phone || '', data.address || '', data.role || 'customer']
        );
        return result.insertId;
    }

    // Cập nhật user
    static async update(id, data) {
        const [result] = await db.query(
            'UPDATE users SET fullname = ?, phone = ?, address = ? WHERE id = ?',
            [data.fullname, data.phone, data.address, id]
        );
        return result.affectedRows;
    }

    // Đổi mật khẩu
    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows;
    }

    // Xác thực mật khẩu
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    // Xóa user
    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = UserModel;
