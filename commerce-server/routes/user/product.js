
const express = require('express');
const router = express.Router();
const userProductController = require('@/controllers/user/product');

// 注意：挂载到这里的路由，在外部(index.js)必须经过 auth 中间件拦截！
router.post('/favorite', userProductController.toggleFavorite);
router.get('/favorite/check/:id', userProductController.checkFavorite);

module.exports = router;