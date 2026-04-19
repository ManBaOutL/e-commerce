// 用户数据路由
const express = require('express')
const router = express.Router()
const auth = require('@/middlewares/auth')
const userDataCtrl = require('@/controllers/manager/userDataCtrl')
const logger = require('@/middlewares/loggerMiddleware');


router.get('/userData', auth.checkAdmin, logger.writeLogMiddleware, userDataCtrl.userData)
router.post('/userData', auth.checkAdmin, logger.writeLogMiddleware, userDataCtrl.updateManagerUserList)


module.exports = router
