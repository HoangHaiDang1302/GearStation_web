const ProductModel = require('../../models/product.model');
const CategoryModel = require('../../models/category.model');
const BrandModel = require('../../models/brand.model');
const OrderModel = require('../../models/order.model');
const UserModel = require('../../models/user.model');
const { slugify } = require('../../utils/helpers');

const MAX_LIMIT = 100;
const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

const toPositiveInt = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeLimit = (value, fallback = 20) => {
    return Math.min(toPositiveInt(value, fallback), MAX_LIMIT);
};

const normalizeBoolean = (value) => {
    return value === true || value === 'true' || value === '1' || value === 1 ? 1 : 0;
};

const parseJsonInput = (value, fallback) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'object') return JSON.stringify(value);

    try {
        JSON.parse(value);
        return value;
    } catch (error) {
        return JSON.stringify(fallback);
    }
};

const buildProductPayload = (body, file, existingProduct = {}) => {
    const name = body.name || existingProduct.name;

    return {
        name,
        slug: body.slug || slugify(name),
        description: body.description !== undefined ? body.description : existingProduct.description,
        price: body.price !== undefined ? body.price : existingProduct.price,
        sale_price: body.sale_price !== undefined && body.sale_price !== '' ? body.sale_price : null,
        image: file ? `/uploads/${file.filename}` : (body.image || existingProduct.image || ''),
        images: parseJsonInput(body.images, existingProduct.images || []),
        category_id: body.category_id || existingProduct.category_id || null,
        brand_id: body.brand_id || existingProduct.brand_id || null,
        stock: body.stock !== undefined ? body.stock : (existingProduct.stock || 0),
        specifications: parseJsonInput(body.specifications, existingProduct.specifications || {}),
        is_featured: normalizeBoolean(body.is_featured)
    };
};

class AdminApiController {
    async dashboard(req, res) {
        try {
            const [totalProducts, totalOrders, categories, brands, users, orderStats] = await Promise.all([
                ProductModel.countAll(),
                OrderModel.countAll(),
                CategoryModel.getAll(),
                BrandModel.getAll(),
                UserModel.getAll(),
                OrderModel.getStats()
            ]);

            return res.json({
                success: true,
                data: {
                    totalProducts,
                    totalOrders,
                    totalCategories: categories.length,
                    totalBrands: brands.length,
                    totalUsers: users.length,
                    orderStats
                }
            });
        } catch (error) {
            console.error('Admin dashboard API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async products(req, res) {
        try {
            const page = toPositiveInt(req.query.page, 1);
            const limit = normalizeLimit(req.query.limit);
            const [products, total] = await Promise.all([
                ProductModel.getAll(page, limit),
                ProductModel.countAll()
            ]);

            return res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Admin products API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async productDetail(req, res) {
        try {
            const product = await ProductModel.getById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
            }

            return res.json({ success: true, data: { product } });
        } catch (error) {
            console.error('Admin product detail API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async createProduct(req, res) {
        try {
            if (!req.body.name || req.body.price === undefined) {
                return res.status(400).json({ success: false, message: 'Ten va gia san pham la bat buoc' });
            }

            const data = buildProductPayload(req.body, req.file);
            const productId = await ProductModel.create(data);
            const product = await ProductModel.getById(productId);

            return res.status(201).json({
                success: true,
                message: 'Da tao san pham',
                data: { product }
            });
        } catch (error) {
            console.error('Admin create product API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const existingProduct = await ProductModel.getById(req.params.id);
            if (!existingProduct) {
                return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
            }

            const data = buildProductPayload(req.body, req.file, existingProduct);
            await ProductModel.update(existingProduct.id, data);
            const product = await ProductModel.getById(existingProduct.id);

            return res.json({
                success: true,
                message: 'Da cap nhat san pham',
                data: { product }
            });
        } catch (error) {
            console.error('Admin update product API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            const deleted = await ProductModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
            }

            return res.json({ success: true, message: 'Da xoa san pham' });
        } catch (error) {
            console.error('Admin delete product API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async categories(req, res) {
        try {
            const categories = await CategoryModel.getAll();
            return res.json({ success: true, data: { categories } });
        } catch (error) {
            console.error('Admin categories API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async createCategory(req, res) {
        try {
            if (!req.body.name) {
                return res.status(400).json({ success: false, message: 'Ten danh muc la bat buoc' });
            }

            const categoryId = await CategoryModel.create({
                ...req.body,
                slug: req.body.slug || slugify(req.body.name)
            });
            const category = await CategoryModel.getById(categoryId);

            return res.status(201).json({
                success: true,
                message: 'Da tao danh muc',
                data: { category }
            });
        } catch (error) {
            console.error('Admin create category API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const existingCategory = await CategoryModel.getById(req.params.id);
            if (!existingCategory) {
                return res.status(404).json({ success: false, message: 'Khong tim thay danh muc' });
            }

            await CategoryModel.update(existingCategory.id, {
                name: req.body.name || existingCategory.name,
                slug: req.body.slug || slugify(req.body.name || existingCategory.name),
                description: req.body.description !== undefined ? req.body.description : existingCategory.description,
                image: req.body.image !== undefined ? req.body.image : existingCategory.image
            });
            const category = await CategoryModel.getById(existingCategory.id);

            return res.json({
                success: true,
                message: 'Da cap nhat danh muc',
                data: { category }
            });
        } catch (error) {
            console.error('Admin update category API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const deleted = await CategoryModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Khong tim thay danh muc' });
            }

            return res.json({ success: true, message: 'Da xoa danh muc' });
        } catch (error) {
            console.error('Admin delete category API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async orders(req, res) {
        try {
            const page = toPositiveInt(req.query.page, 1);
            const limit = normalizeLimit(req.query.limit);
            const [orders, total] = await Promise.all([
                OrderModel.getAll(page, limit),
                OrderModel.countAll()
            ]);

            return res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Admin orders API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async orderDetail(req, res) {
        try {
            const order = await OrderModel.getById(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Khong tim thay don hang' });
            }

            const items = await OrderModel.getItems(order.id);
            return res.json({ success: true, data: { order, items } });
        } catch (error) {
            console.error('Admin order detail API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { status } = req.body;
            if (!ORDER_STATUSES.includes(status)) {
                return res.status(400).json({ success: false, message: 'Trang thai don hang khong hop le' });
            }

            const updated = await OrderModel.updateStatus(req.params.id, status);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Khong tim thay don hang' });
            }

            const order = await OrderModel.getById(req.params.id);
            return res.json({
                success: true,
                message: 'Da cap nhat trang thai don hang',
                data: { order }
            });
        } catch (error) {
            console.error('Admin update order status API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async users(req, res) {
        try {
            const users = await UserModel.getAll();
            return res.json({ success: true, data: { users } });
        } catch (error) {
            console.error('Admin users API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }
}

module.exports = new AdminApiController();
