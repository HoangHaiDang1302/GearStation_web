const CartModel = require('../../models/cart.model');
const ProductModel = require('../../models/product.model');

class CartApiController {
    // [GET] /api/v1/cart - Lấy thông tin giỏ hàng
    async getCart(req, res) {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
            }
            const userId = req.session.user.id;
            const items = await CartModel.getByUserId(userId);
            const total = await CartModel.getTotal(userId);
            const cartCount = await CartModel.countItems(userId);

            return res.status(200).json({
                success: true,
                data: {
                    items,
                    total,
                    cartCount
                }
            });
        } catch (error) {
            console.error('Lỗi getCart API:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }

    // [POST] /api/v1/cart/add - Thêm vào giỏ hàng
    async add(req, res) {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
            }
            const userId = req.session.user.id;
            const { productId, quantity } = req.body;
            const addQuantity = parseInt(quantity, 10) || 1;
            const product = await ProductModel.getById(productId);
            const cartItem = await CartModel.getItem(userId, productId);

            if (!product) {
                return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
            }

            if (addQuantity <= 0) {
                return res.status(400).json({ success: false, message: 'So luong khong hop le' });
            }

            if ((cartItem ? cartItem.quantity : 0) + addQuantity > product.stock) {
                return res.status(400).json({ success: false, message: `San pham chi con ${product.stock} trong kho` });
            }

            await CartModel.addItem(userId, productId, addQuantity);
            const cartCount = await CartModel.countItems(userId);

            return res.status(200).json({
                success: true,
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                data: {
                    cartCount
                }
            });
        } catch (error) {
            console.error('Lỗi addToCart API:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }

    // [PUT] /api/v1/cart/update - Cập nhật số lượng
    async update(req, res) {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
            }
            const userId = req.session.user.id;
            const { productId, quantity } = req.body;
            const nextQuantity = parseInt(quantity, 10);

            if (nextQuantity <= 0) {
                await CartModel.removeItem(userId, productId);
            } else {
                const product = await ProductModel.getById(productId);
                if (!product) {
                    return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
                }

                if (nextQuantity > product.stock) {
                    return res.status(400).json({ success: false, message: `San pham chi con ${product.stock} trong kho` });
                }

                await CartModel.updateQuantity(userId, productId, nextQuantity);
            }

            const cartCount = await CartModel.countItems(userId);
            const total = await CartModel.getTotal(userId);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật giỏ hàng thành công',
                data: {
                    cartCount,
                    total
                }
            });
        } catch (error) {
            console.error('Lỗi updateCart API:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }

    // [DELETE] /api/v1/cart/remove - Xóa sản phẩm khỏi giỏ
    async remove(req, res) {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
            }
            const userId = req.session.user.id;
            const { productId } = req.body;

            await CartModel.removeItem(userId, productId);
            const cartCount = await CartModel.countItems(userId);
            const total = await CartModel.getTotal(userId);

            return res.status(200).json({
                success: true,
                message: 'Đã xóa sản phẩm',
                data: {
                    cartCount,
                    total
                }
            });
        } catch (error) {
            console.error('Lỗi removeCart API:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
}

module.exports = new CartApiController();
