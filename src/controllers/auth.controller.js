const UserModel = require('../models/user.model');

class AuthController {
    // [GET] /auth/login - Trang đăng nhập
    async loginPage(req, res) {
        if (req.session.user) return res.redirect('/');
        res.render('auth/login', { title: 'Đăng nhập', error: null });
    }

    // [POST] /auth/login - Xử lý đăng nhập
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await UserModel.getByEmail(email);

            if (!user) {
                return res.render('auth/login', {
                    title: 'Đăng nhập',
                    error: 'Email không tồn tại!'
                });
            }

            const isValid = await UserModel.verifyPassword(password, user.password);
            if (!isValid) {
                return res.render('auth/login', {
                    title: 'Đăng nhập',
                    error: 'Mật khẩu không đúng!'
                });
            }

            // Lưu session
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                role: user.role
            };

            // Redirect admin về trang admin, user về trang chủ
            if (user.role === 'admin') {
                return res.redirect('/admin');
            }
            res.redirect('/');
        } catch (error) {
            console.error('Login error:', error);
            res.render('auth/login', {
                title: 'Đăng nhập',
                error: 'Đã xảy ra lỗi, vui lòng thử lại!'
            });
        }
    }

    // [GET] /auth/register - Trang đăng ký
    async registerPage(req, res) {
        if (req.session.user) return res.redirect('/');
        res.render('auth/register', { title: 'Đăng ký', error: null });
    }

    // [POST] /auth/register - Xử lý đăng ký
    async register(req, res) {
        try {
            const { username, email, password, confirmPassword, fullname, phone } = req.body;

            // Validation
            if (password !== confirmPassword) {
                return res.render('auth/register', {
                    title: 'Đăng ký',
                    error: 'Mật khẩu xác nhận không khớp!'
                });
            }

            // Kiểm tra email đã tồn tại
            const existingEmail = await UserModel.getByEmail(email);
            if (existingEmail) {
                return res.render('auth/register', {
                    title: 'Đăng ký',
                    error: 'Email đã được sử dụng!'
                });
            }

            // Kiểm tra username đã tồn tại
            const existingUsername = await UserModel.getByUsername(username);
            if (existingUsername) {
                return res.render('auth/register', {
                    title: 'Đăng ký',
                    error: 'Tên đăng nhập đã được sử dụng!'
                });
            }

            // Tạo tài khoản
            await UserModel.create({ username, email, password, fullname, phone });
            res.redirect('/auth/login');
        } catch (error) {
            console.error('Register error:', error);
            res.render('auth/register', {
                title: 'Đăng ký',
                error: 'Đã xảy ra lỗi, vui lòng thử lại!'
            });
        }
    }

    // [GET] /auth/logout - Đăng xuất
    async logout(req, res) {
        req.session.destroy((err) => {
            if (err) console.error('Logout error:', err);
            res.redirect('/');
        });
    }
}

module.exports = new AuthController();
