const express = require('express')

const router = express.Router();
const allOperationLogCtrl = require('@/controllers/manager/allOperationLogCtrl');
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');

router.get('/alloperationlogs', auth.checkAdmin, logger.writeLogMiddleware, allOperationLogCtrl.getAllOperationLog);


module.exports = router