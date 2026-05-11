const express = require('express')
const router = express.Router()
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');


const merchantInfoCtrl = require('@/controllers/merchant/merchantInfoCtrl')
router.get('/info', auth.checkMerchant, logger.writeLogMiddleware, merchantInfoCtrl.getMerchantInfo)
router.post('/info', auth.checkMerchant, logger.writeLogMiddleware, merchantInfoCtrl.createShop)


module.exports = router