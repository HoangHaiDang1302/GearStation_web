const apiAuthMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Vui long dang nhap'
    });
};

module.exports = apiAuthMiddleware;
