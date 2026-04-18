const express = require('express')

const router = express.Router();
const allCouponCtrl = require('@/controllers/manager/allCouponCtrl');
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');

router.get('/allcoupons', auth.checkAdmin, logger.writeLogMiddleware, allCouponCtrl.getAllCoupon);
router.post('/allcoupons', auth.checkAdmin, logger.writeLogMiddleware, allCouponCtrl.updateCouponStatus);


module.exports = router