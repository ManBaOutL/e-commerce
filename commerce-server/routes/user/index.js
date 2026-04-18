const express = require('express');
const router = express.Router();
const auth = require('@/middlewares/auth'); // 引入你的 Token 验证中间件

// ==========================================
//  User (普通用户模块，必须验证 Token)
// ==========================================
router.use('/user', auth.checkLogin, (req, res, next) => {
    // 🌟 修复：使用 req.user.type，并兼容可能的数据解构结构
    const userType = req.user.type || req.user.user_type; 
    
    if (userType === '普通用户') {
        next();
    } else {
        res.status(403).json({ status: 403, success: false, message: '仅限普通用户访问' });
    }
});

// 挂载普通用户的商品操作路由
router.use('/user/comment', require('./comment'));
// 以后还可以接着写：
router.use('/user/coupons', require('./coupon'));
router.use('/user/cart', require('./cart'));
router.use('/user/order', require('./order'));
router.use('/user/address', require('./address'));
router.use('/user/favorite', require('./favorite'));


module.exports = router;