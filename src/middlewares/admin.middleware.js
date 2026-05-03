// Middleware kiểm tra quyền Admin
// Yêu cầu đăng nhập + role = 'admin'

const adminMiddleware = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }

    // Chưa đăng nhập
    if (!req.session || !req.session.user) {
        return res.redirect('/auth/login');
    }

    // Đã đăng nhập nhưng không phải admin
    return res.status(403).render('errors/404', {
        title: '403 - Không có quyền truy cập'
    });
};

module.exports = adminMiddleware;
