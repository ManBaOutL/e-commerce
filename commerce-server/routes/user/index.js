const express = require('express');
const router = express.Router();
const auth = require('@/middlewares/auth'); // 引入你的 Token 验证中间件

// ==========================================
//  User (普通用户模块，必须验证 Token)
// ==========================================
router.use('/user', auth.checkLogin, (req, res, next) => {
    next();
});

// 挂载普通用户的商品操作路由
router.use('/user/profile', require('./profile'));
router.use('/user/comment', require('./comment'));
router.use('/user/coupons', require('./coupon'));
router.use('/user/cart', require('./cart'));
router.use('/user/order', require('./order'));
router.use('/user/address', require('./address'));
router.use('/user/favorite', require('./favorite'));
router.use('/user/statistics', require('./statistics'));
// 文件上传
router.use('/user/media', require('./upload'));

module.exports = router;