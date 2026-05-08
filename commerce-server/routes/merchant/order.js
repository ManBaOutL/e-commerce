const express = require('express')

const router = express.Router();
const merchantOrderCtrl = require('@/controllers/merchant/merchantOrderCtrl');
const auth = require('@/middlewares/auth')
//const logger = require('@/middlewares/loggerMiddleware')


router.get('/orders', auth.checkMerchant, merchantOrderCtrl.getMerchantOrderList);
router.post('/orders/refund/audit', auth.checkMerchant, merchantOrderCtrl.auditRefund);
router.post('/orders/ship', auth.checkMerchant, merchantOrderCtrl.shipOrder);


module.exports = router
