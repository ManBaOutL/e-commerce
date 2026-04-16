const express = require('express');
const router = express.Router();
const productController = require('@/controllers/front/productCtrl');

// 商品列表
router.get('/list', productController.getList);
// 商品详情
router.get('/detail/:id', productController.getDetail);
// 商品分类
router.get('/category', productController.getCategoryTree);
// 商品评论
router.get('/comments/:id', productController.getComments);

module.exports = router;
