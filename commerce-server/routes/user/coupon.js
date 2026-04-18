const express = require('express');
const router = express.Router();
const couponController = require('@/controllers/user/couponCtrl');

// 优惠券
router.get('/list',  couponController.getMyCoupons);

module.exports = router;
