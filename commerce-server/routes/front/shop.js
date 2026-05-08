const express = require('express');
const router = express.Router();
const shopController = require('@/controllers/front/shopCtrl');

// 商品列表
router.get('/:id', shopController.getShopInfo);
// 商品详情
router.get('/:id/products', shopController.getShopProducts);

module.exports = router;
