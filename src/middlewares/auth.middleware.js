// Middleware xác thực (Authentication)
// Kiểm tra người dùng đã đăng nhập chưa

const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/auth/login');
};

module.exports = authMiddleware;
