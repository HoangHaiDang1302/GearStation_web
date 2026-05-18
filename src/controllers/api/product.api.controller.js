const ProductModel = require('../../models/product.model');
const CategoryModel = require('../../models/category.model');
const BrandModel = require('../../models/brand.model');
const ReviewModel = require('../../models/review.model');

const MAX_LIMIT = 50;

const toPositiveInt = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeLimit = (value, fallback = 12) => {
    return Math.min(toPositiveInt(value, fallback), MAX_LIMIT);
};

const parseJsonField = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== 'string') return value;

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const normalizeProduct = (product) => {
    if (!product) return product;

    return {
        ...product,
        images: parseJsonField(product.images, []),
        specifications: parseJsonField(product.specifications, {})
    };
};

class ProductApiController {
    async list(req, res) {
        try {
            const page = toPositiveInt(req.query.page, 1);
            const limit = normalizeLimit(req.query.limit);
            const keyword = (req.query.q || '').trim();
            const categoryFilter = req.query.category || req.query.categoryId;
            const brandFilter = req.query.brand || req.query.brandId;
            const featuredOnly = req.query.featured === 'true' || req.query.featured === '1';

            let products = [];
            let total = 0;
            let filter = null;

            if (keyword) {
                products = await ProductModel.search(keyword, page, limit);
                total = await ProductModel.countSearch(keyword);
                filter = { type: 'search', value: keyword };
            } else if (categoryFilter) {
                const category = /^\d+$/.test(String(categoryFilter))
                    ? await CategoryModel.getById(categoryFilter)
                    : await CategoryModel.getBySlug(categoryFilter);

                if (!category) {
                    return res.status(404).json({ success: false, message: 'Khong tim thay danh muc' });
                }

                products = await ProductModel.getByCategory(category.id, page, limit);
                total = await ProductModel.countByCategory(category.id);
                filter = { type: 'category', value: category };
            } else if (brandFilter) {
                const brand = /^\d+$/.test(String(brandFilter))
                    ? await BrandModel.getById(brandFilter)
                    : await BrandModel.getBySlug(brandFilter);

                if (!brand) {
                    return res.status(404).json({ success: false, message: 'Khong tim thay thuong hieu' });
                }

                products = await ProductModel.getByBrand(brand.id, page, limit);
                total = await ProductModel.countByBrand(brand.id);
                filter = { type: 'brand', value: brand };
            } else if (featuredOnly) {
                products = await ProductModel.getFeatured(limit);
                total = products.length;
                filter = { type: 'featured', value: true };
            } else {
                products = await ProductModel.getAll(page, limit);
                total = await ProductModel.countAll();
            }

            return res.json({
                success: true,
                data: {
                    products: products.map(normalizeProduct),
                    filter,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Product list API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async detail(req, res) {
        try {
            const value = req.params.idOrSlug;
            const product = /^\d+$/.test(value)
                ? await ProductModel.getById(value)
                : await ProductModel.getBySlug(value);

            if (!product) {
                return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
            }

            const relatedProducts = product.category_id
                ? await ProductModel.getRelated(product.id, product.category_id, 4)
                : [];
            const reviewStats = await ReviewModel.getStats(product.id);

            return res.json({
                success: true,
                data: {
                    product: normalizeProduct(product),
                    relatedProducts: relatedProducts.map(normalizeProduct),
                    reviewStats
                }
            });
        } catch (error) {
            console.error('Product detail API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async featured(req, res) {
        try {
            const limit = normalizeLimit(req.query.limit, 8);
            const products = await ProductModel.getFeatured(limit);
            return res.json({ success: true, data: { products: products.map(normalizeProduct) } });
        } catch (error) {
            console.error('Featured products API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async latest(req, res) {
        try {
            const limit = normalizeLimit(req.query.limit, 8);
            const products = await ProductModel.getLatest(limit);
            return res.json({ success: true, data: { products: products.map(normalizeProduct) } });
        } catch (error) {
            console.error('Latest products API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async categories(req, res) {
        try {
            const categories = await CategoryModel.getAll();
            return res.json({ success: true, data: { categories } });
        } catch (error) {
            console.error('Categories API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async brands(req, res) {
        try {
            const brands = await BrandModel.getAll();
            return res.json({ success: true, data: { brands } });
        } catch (error) {
            console.error('Brands API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async reviews(req, res) {
        try {
            const product = await ProductModel.getById(req.params.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
            }

            const [reviews, stats] = await Promise.all([
                ReviewModel.getByProductId(product.id),
                ReviewModel.getStats(product.id)
            ]);

            return res.json({ success: true, data: { reviews, stats } });
        } catch (error) {
            console.error('Reviews API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }

    async createReview(req, res) {
        try {
            const userId = req.session.user.id;
            const productId = req.params.productId;
            const rating = toPositiveInt(req.body.rating, 0);
            const comment = (req.body.comment || '').trim();

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ success: false, message: 'Rating phai tu 1 den 5' });
            }

            const product = await ProductModel.getById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
            }

            const reviewed = await ReviewModel.hasReviewed(productId, userId);
            if (reviewed) {
                return res.status(409).json({ success: false, message: 'Ban da danh gia san pham nay' });
            }

            const reviewId = await ReviewModel.create({
                product_id: productId,
                user_id: userId,
                rating,
                comment
            });

            return res.status(201).json({
                success: true,
                message: 'Da them danh gia',
                data: { reviewId }
            });
        } catch (error) {
            console.error('Create review API error:', error);
            return res.status(500).json({ success: false, message: 'Loi server', error: error.message });
        }
    }
}

module.exports = new ProductApiController();
