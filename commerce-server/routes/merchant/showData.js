const express = require('express')
const router = express.Router()
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');


const showDataCtrl = require('@/controllers/merchant/showDataCtrl')
router.get('/showData', auth.checkMerchant, showDataCtrl.showData)

module.exports = router