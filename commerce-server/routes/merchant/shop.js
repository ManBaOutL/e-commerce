const express = require('express')
const router = express.Router()
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');


const shopCtrl = require('@/controllers/merchant/shopCtrl')
router.get('/shop', auth.checkMerchant, shopCtrl.getShopData)
router.post('/shop', auth.checkMerchant, shopCtrl.updateShopData)

module.exports = router