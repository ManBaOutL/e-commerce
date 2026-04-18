const express = require('express');
const router = express.Router();
const couponController = require('@/controllers/user/couponCtrl');
const authMiddleware = require('@/middlewares/auth');

// 优惠券
router.get('/list',  authMiddleware.checkUser,couponController.getMyCoupons);

module.exports = router;
