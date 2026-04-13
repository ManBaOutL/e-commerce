const express = require('express')
const router = express.Router()

const loginController = require('@/controllers/front/login')

// 挂载登录路由
router.post('/login', loginController.login)
// 挂载注册路由
router.post('/register', loginController.register)
// 挂载忘记密码路由
router.post('/forget', loginController.forget)
// 挂载验证码路由
router.post('/code', loginController.getCode)

module.exports = router