const express = require('express');
const router = express.Router();
const productController = require('@/controllers/front/product');

router.get('/list', productController.getList);
router.get('/detail/:id', productController.getDetail);
router.get('/category', productController.getCategoryTree);

module.exports = router;
