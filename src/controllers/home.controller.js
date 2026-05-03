const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');

class HomeController {
    // [GET] / - Trang chủ
    async index(req, res, next) {
        try {
            let featuredProducts = [];
            let latestProducts = [];
            let categories = [];

            try {
                featuredProducts = await ProductModel.getFeatured(8);
                latestProducts = await ProductModel.getLatest(8);
                categories = await CategoryModel.getAll();
            } catch (dbError) {
                console.warn('⚠️  Chưa kết nối được database:', dbError.message);
            }

            res.render('home', {
                title: 'Trang chủ - Linh kiện máy tính',
                featuredProducts,
                latestProducts,
                categories
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new HomeController();
