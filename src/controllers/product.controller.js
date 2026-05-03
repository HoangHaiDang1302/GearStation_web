const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');

class ProductController {
    // [GET] /products - Danh sách sản phẩm
    async index(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 12;

            const products = await ProductModel.getAll(page, limit);
            const total = await ProductModel.countAll();
            const categories = await CategoryModel.getAll();
            const totalPages = Math.ceil(total / limit);

            res.render('products/index', {
                title: 'Sản phẩm',
                products,
                categories,
                currentPage: page,
                totalPages,
                total
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /products/:slug - Chi tiết sản phẩm
    async detail(req, res, next) {
        try {
            const product = await ProductModel.getBySlug(req.params.slug);
            if (!product) {
                return res.status(404).render('errors/404', { title: 'Không tìm thấy sản phẩm' });
            }

            // Sản phẩm liên quan (cùng danh mục)
            const relatedProducts = await ProductModel.getByCategory(product.category_id, 1, 4);

            res.render('products/detail', {
                title: product.name,
                product,
                relatedProducts: relatedProducts.filter(p => p.id !== product.id)
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /products/category/:slug - Sản phẩm theo danh mục
    async byCategory(req, res, next) {
        try {
            const category = await CategoryModel.getBySlug(req.params.slug);
            if (!category) {
                return res.status(404).render('errors/404', { title: 'Không tìm thấy danh mục' });
            }

            const page = parseInt(req.query.page) || 1;
            const limit = 12;

            const products = await ProductModel.getByCategory(category.id, page, limit);
            const total = await ProductModel.countByCategory(category.id);
            const categories = await CategoryModel.getAll();
            const totalPages = Math.ceil(total / limit);

            res.render('products/index', {
                title: `Danh mục: ${category.name}`,
                products,
                categories,
                currentCategory: category,
                currentPage: page,
                totalPages,
                total
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /products/search - Tìm kiếm sản phẩm
    async search(req, res, next) {
        try {
            const keyword = req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const limit = 12;

            const products = await ProductModel.search(keyword, page, limit);
            const total = await ProductModel.countSearch(keyword);
            const categories = await CategoryModel.getAll();
            const totalPages = Math.ceil(total / limit);

            res.render('products/index', {
                title: `Tìm kiếm: ${keyword}`,
                products,
                categories,
                keyword,
                currentPage: page,
                totalPages,
                total
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
