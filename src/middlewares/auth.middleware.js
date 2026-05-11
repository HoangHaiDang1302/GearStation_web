// Middleware xác thực (Authentication)
// Kiểm tra người dùng đã đăng nhập chưa

const authMiddleware = async (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    // Chưa đăng nhập → redirect về trang login
    return res.redirect('/auth/login');
};

module.exports = authMiddleware;
