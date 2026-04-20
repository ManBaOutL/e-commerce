const express = require('express');
const router = express.Router();
const profileCtrl = require('@/controllers/user/profileCtrl'); // 包含 updateProfile 和上传方法
const auth = require('@/middlewares/auth'); // JWT 验证中间件

// 🌟 修改资料路由
router.post('/update', auth.checkUser, profileCtrl.updateProfile);

module.exports = router;