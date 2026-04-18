const express = require('express');
const router = express.Router();
const orderController = require('@/controllers/user/orderCtrl');
const authMiddleware = require('@/middlewares/auth');

router.post('/create',authMiddleware.checkUser, orderController.createOrder);
router.get('/list', orderController.getOrderList);
router.post('/pay',authMiddleware.checkUser, orderController.payOrder);
router.post('/applyRefund', authMiddleware.checkUser,orderController.applyRefund);
router.post('/cancel',authMiddleware.checkUser, orderController.cancelOrder);

module.exports = router;