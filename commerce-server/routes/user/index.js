const express = require('express');
const router = express.Router();
const auth = require('@/middlewares/auth'); // 引入你的 Token 验证中间件
const logger = require('@/middlewares/loggerMiddleware');

// 👇 🌟 关键修复 1：引入 orderCtrl 控制器
const orderController = require('@/controllers/user/orderCtrl');

// 👇 🌟 关键修复 2：在安检站之前，单独给支付宝开一个免检通道！
router.post('/user/order/alipayNotify', orderController.alipayNotify);

// ==========================================
//  User (普通用户模块，必须验证 Token)
// ==========================================
router.use('/user', auth.checkLogin, logger.writeUserLogMiddleware, (req, res, next) => {
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