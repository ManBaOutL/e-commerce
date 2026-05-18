const express = require('express')
const router = express.Router()

const loginController = require('@/controllers/front/loginCtrl')
const { writeAuthLogMiddleware } = require('@/middlewares/loggerMiddleware')
const { loginRateLimit, strictRateLimit } = require('@/middlewares/rateLimit')

// 挂载登录路由（添加频率限制）
router.post('/login', loginRateLimit(), writeAuthLogMiddleware, loginController.login)
// 挂载注册路由（添加频率限制）
router.post('/register', loginRateLimit(), writeAuthLogMiddleware, loginController.register)
// 挂载忘记密码路由（添加频率限制）
router.post('/forget', loginRateLimit(), writeAuthLogMiddleware, loginController.forget)
// 挂载验证码路由（严格限制，防止刷验证码）
router.post('/code', strictRateLimit(), loginController.getCode)
// 挂载支付宝登录路由（添加频率限制）
router.post('/alipayLogin', loginRateLimit(), writeAuthLogMiddleware, loginController.alipayLogin)

// 挂载商品路由
router.use('/front/product', require('./product'));
router.use('/front/activity', require('./activity'));
router.use('/front/shop', require('./shop'));

module.exports = router