const express = require('express');
const router = express.Router();
const orderController = require('@/controllers/user/orderCtrl');

router.post('/create', orderController.createOrder);
router.get('/list', orderController.getOrderList);
router.post('/pay', orderController.payOrder);
router.post('/applyRefund', orderController.applyRefund);
router.post('/cancel', orderController.cancelOrder);

module.exports = router;