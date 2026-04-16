const express = require('express');
const router = express.Router();
const productController = require('@/controllers/user/productCtrl');

// 商品评论
router.post('/comment/add',  productCtrl.addComment);

module.exports = router;
