const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');

class HomeController {
    // [GET] / - Trang chủ
    async index(req, res, next) {
        try {
            const featuredProducts = await ProductModel.getFeatured(8);
            const latestProducts = await ProductModel.getLatest(8);
            const categories = await CategoryModel.getAll();

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
