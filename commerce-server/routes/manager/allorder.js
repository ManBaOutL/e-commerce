const express = require('express')
const auth = require('@/middlewares/auth');
const router = express.Router();
const allOrderCtrl = require('@/controllers/manager/allOrderCtrl');

router.get('/allorder', allOrderCtrl.getAllOrder);
router.post('/allorder', allOrderCtrl.postOrder);

module.exports = router
