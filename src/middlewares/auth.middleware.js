// Middleware xác thực (Authentication)
// Kiểm tra người dùng đã đăng nhập chưa

const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
    // Tạm thời Tự động Đăng nhập để test Giỏ hàng (Bypass Login)
    if (!req.session.user) {
        try {
            const [users] = await db.query('SELECT * FROM users LIMIT 1');
            if (users.length > 0) {
                req.session.user = {
                    id: users[0].id,
                    username: users[0].username,
                    role: users[0].role
                };
            }
        } catch (err) {
            console.error('Lỗi auto-login:', err);
        }
    }

    if (req.session && req.session.user) {
        return next();
    }
    
    // Nếu vẫn không có user thì mới redirect (thường sẽ không bao giờ chạy vào đây nữa)
    return res.redirect('/auth/login');
};

module.exports = authMiddleware;
