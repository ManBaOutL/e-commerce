const express = require('express')
const router = express.Router()
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');


const shopCtrl = require('@/controllers/merchant/shopCtrl')
router.get('/shop', auth.checkMerchant, logger.writeLogMiddleware, shopCtrl.getShopData)
router.post('/shop', auth.checkMerchant, logger.writeLogMiddleware, shopCtrl.updateShopData)

module.exports = router