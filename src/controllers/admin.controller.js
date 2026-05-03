const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');
const OrderModel = require('../models/order.model');
const UserModel = require('../models/user.model');

class AdminController {
    // ============================================
    // Dashboard
    // ============================================

    // [GET] /admin - Dashboard
    async dashboard(req, res, next) {
        try {
            const totalProducts = await ProductModel.countAll();
            const totalOrders = await OrderModel.countAll();

            res.render('admin/dashboard', {
                title: 'Admin - Dashboard',
                layout: 'admin',
                totalProducts,
                totalOrders
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================================
    // Quản lý sản phẩm
    // ============================================

    // [GET] /admin/products - Danh sách sản phẩm
    async productList(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const products = await ProductModel.getAll(page, 20);
            const total = await ProductModel.countAll();
            const totalPages = Math.ceil(total / 20);

            res.render('admin/products/index', {
                title: 'Quản lý sản phẩm',
                layout: 'admin',
                products,
                currentPage: page,
                totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /admin/products/create - Form tạo sản phẩm
    async productCreatePage(req, res, next) {
        try {
            const categories = await CategoryModel.getAll();
            res.render('admin/products/create', {
                title: 'Thêm sản phẩm',
                layout: 'admin',
                categories,
                error: null
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /admin/products/create - Xử lý tạo sản phẩm
    async productCreate(req, res, next) {
        try {
            const { slugify } = require('../utils/helpers');
            const data = {
                ...req.body,
                slug: slugify(req.body.name),
                image: req.file ? `/uploads/${req.file.filename}` : ''
            };

            await ProductModel.create(data);
            res.redirect('/admin/products');
        } catch (error) {
            next(error);
        }
    }

    // [GET] /admin/products/edit/:id - Form sửa sản phẩm
    async productEditPage(req, res, next) {
        try {
            const product = await ProductModel.getById(req.params.id);
            const categories = await CategoryModel.getAll();

            if (!product) {
                return res.status(404).render('errors/404', { title: 'Không tìm thấy sản phẩm' });
            }

            res.render('admin/products/edit', {
                title: 'Sửa sản phẩm',
                layout: 'admin',
                product,
                categories,
                error: null
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /admin/products/edit/:id - Xử lý sửa sản phẩm
    async productUpdate(req, res, next) {
        try {
            const { slugify } = require('../utils/helpers');
            const data = {
                ...req.body,
                slug: slugify(req.body.name)
            };

            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }

            await ProductModel.update(req.params.id, data);
            res.redirect('/admin/products');
        } catch (error) {
            next(error);
        }
    }

    // [POST] /admin/products/delete/:id - Xóa sản phẩm
    async productDelete(req, res, next) {
        try {
            await ProductModel.delete(req.params.id);
            res.redirect('/admin/products');
        } catch (error) {
            next(error);
        }
    }

    // ============================================
    // Quản lý danh mục
    // ============================================

    // [GET] /admin/categories - Danh sách danh mục
    async categoryList(req, res, next) {
        try {
            const categories = await CategoryModel.getAll();
            res.render('admin/categories/index', {
                title: 'Quản lý danh mục',
                layout: 'admin',
                categories
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /admin/categories/create - Tạo danh mục
    async categoryCreate(req, res, next) {
        try {
            const { slugify } = require('../utils/helpers');
            const data = {
                ...req.body,
                slug: slugify(req.body.name)
            };
            await CategoryModel.create(data);
            res.redirect('/admin/categories');
        } catch (error) {
            next(error);
        }
    }

    // [POST] /admin/categories/edit/:id - Sửa danh mục
    async categoryUpdate(req, res, next) {
        try {
            const { slugify } = require('../utils/helpers');
            const data = {
                ...req.body,
                slug: slugify(req.body.name)
            };
            await CategoryModel.update(req.params.id, data);
            res.redirect('/admin/categories');
        } catch (error) {
            next(error);
        }
    }

    // [POST] /admin/categories/delete/:id - Xóa danh mục
    async categoryDelete(req, res, next) {
        try {
            await CategoryModel.delete(req.params.id);
            res.redirect('/admin/categories');
        } catch (error) {
            next(error);
        }
    }

    // ============================================
    // Quản lý đơn hàng
    // ============================================

    // [GET] /admin/orders - Danh sách đơn hàng
    async orderList(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const orders = await OrderModel.getAll(page, 20);
            const total = await OrderModel.countAll();
            const totalPages = Math.ceil(total / 20);

            res.render('admin/orders/index', {
                title: 'Quản lý đơn hàng',
                layout: 'admin',
                orders,
                currentPage: page,
                totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /admin/orders/:id - Chi tiết đơn hàng
    async orderDetail(req, res, next) {
        try {
            const order = await OrderModel.getById(req.params.id);
            if (!order) {
                return res.status(404).render('errors/404', { title: 'Không tìm thấy đơn hàng' });
            }

            const items = await OrderModel.getItems(order.id);

            res.render('admin/orders/detail', {
                title: `Đơn hàng #${order.id}`,
                layout: 'admin',
                order,
                items
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /admin/orders/:id/status - Cập nhật trạng thái
    async orderUpdateStatus(req, res, next) {
        try {
            await OrderModel.updateStatus(req.params.id, req.body.status);
            res.redirect(`/admin/orders/${req.params.id}`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
