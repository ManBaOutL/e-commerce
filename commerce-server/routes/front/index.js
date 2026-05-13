const express = require('express')
const router = express.Router()

const loginController = require('@/controllers/front/loginCtrl')
const { writeAuthLogMiddleware } = require('@/middlewares/loggerMiddleware')

// 挂载登录路由
router.post('/login', writeAuthLogMiddleware, loginController.login)
// 挂载注册路由
router.post('/register',writeAuthLogMiddleware,loginController.register)
// 挂载忘记密码路由
router.post('/forget', writeAuthLogMiddleware,loginController.forget)
// 挂载验证码路由
router.post('/code', loginController.getCode)
// 挂载支付宝登录路由
router.post('/alipayLogin', writeAuthLogMiddleware,loginController.alipayLogin)

// 挂载商品路由
router.use('/front/product', require('./product'));
router.use('/front/activity', require('./activity'));
router.use('/front/shop', require('./shop'));

module.exports = router