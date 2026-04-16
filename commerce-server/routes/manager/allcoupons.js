const express = require('express')

const router = express.Router();
const allCouponCtrl = require('@/controllers/manager/allCouponCtrl');
const auth = require('@/middlewares/auth')

router.get('/allcoupons', auth.checkAdmin, allCouponCtrl.getAllCoupon);
router.post('/allcoupons', auth.checkAdmin, allCouponCtrl.updateCouponStatus);


module.exports = router