const express = require('express');
const router = express.Router();
const cartController = require('@/controllers/user/cartCtrl');
const authMiddleware = require('@/middlewares/auth');

// 购物车
router.get('/list', cartController.getCartList);
router.post('/add', authMiddleware.checkUser, cartController.addToCart);
router.put('/update', authMiddleware.checkUser, cartController.updateQuantity);
router.post('/remove', authMiddleware.checkUser, cartController.removeItems);

module.exports = router;
