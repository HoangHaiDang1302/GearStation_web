const apiAdminMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Vui long dang nhap'
        });
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Khong co quyen truy cap'
        });
    }

    return next();
};

module.exports = apiAdminMiddleware;
