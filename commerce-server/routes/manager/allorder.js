const express = require('express')
const auth = require('@/middlewares/auth');
const router = express.Router();
const allOrderCtrl = require('@/controllers/manager/allOrderCtrl');
const logger = require('@/middlewares/loggerMiddleware');


router.get('/allorder', auth.checkAdmin, logger.writeLogMiddleware, allOrderCtrl.getAllOrder);
router.post('/allorder', auth.checkAdmin, logger.writeLogMiddleware, allOrderCtrl.postOrder);

module.exports = router
