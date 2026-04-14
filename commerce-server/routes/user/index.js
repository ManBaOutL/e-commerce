const express = require('express');
const router = express.Router();
const auth = require('@/middlewares/auth'); // 引入你的 Token 验证中间件

// ==========================================
//  User (普通用户模块，必须验证 Token)
// ==========================================
// 给所有 /user 开头的请求加上一把锁
router.use('/user', auth.verifyToken, (req, res, next) => {
    // 拦截校验：只有普通用户才能访问这个组里的接口
    if (req.user.user_type === '普通用户') {
        next();
    } else {
        res.status(403).json({ status: 403, success: false, message: '仅限普通用户访问' });
    }
});

// 挂载普通用户的商品操作路由
router.use('/user/product', require('./product'));
// 以后还可以接着写：
// router.use('/user/cart', require('./user/cart'));
// router.use('/user/order', require('./user/order'));

module.exports = router;