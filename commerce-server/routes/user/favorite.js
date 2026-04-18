const express = require('express');
const router = express.Router();
const favoriteController = require('@/controllers/user/favoriteCtrl');

// 地址相关接口
router.post('/toggle', favoriteController.toggleFavorite);
router.get('/list', favoriteController.getList);
router.post('/remove', favoriteController.removeFavorite);

module.exports = router;
