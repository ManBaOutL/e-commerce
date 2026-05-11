const express = require('express')

const router = express.Router();
const commentCtrl = require('@/controllers/merchant/commentCtrl');
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');

router.get('/comments', auth.checkMerchant, logger.writeLogMiddleware, commentCtrl.getComment);
router.post('/comments', auth.checkMerchant, logger.writeLogMiddleware, commentCtrl.updateComment);


module.exports = router