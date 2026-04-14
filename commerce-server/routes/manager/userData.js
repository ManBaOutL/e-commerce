// 用户数据路由
const express = require('express')
const router = express.Router()
const auth = require('@/middlewares/auth')
const userDataCtrl = require('@/controllers/manager/userDataCtrl')

router.get('/userData', userDataCtrl.userData)
router.post('/userData', userDataCtrl.updateManagerUserList)


module.exports = router
