const express = require('express');
const router = express.Router();
const favoriteController = require('@/controllers/user/favoriteCtrl');
const authMiddleware = require('@/middlewares/auth');

// 地址相关接口
router.post('/toggle', authMiddleware.checkUser,favoriteController.toggleFavorite);
router.get('/list',favoriteController.getList);
router.post('/remove', authMiddleware.checkUser,favoriteController.removeFavorite);

module.exports = router;
