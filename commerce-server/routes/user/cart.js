const express = require('express');
const router = express.Router();
const cartController = require('@/controllers/user/cartCtrl');

// 购物车
router.get('/list', cartController.getCartList);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateQuantity);
router.post('/remove', cartController.removeItems);

module.exports = router;
