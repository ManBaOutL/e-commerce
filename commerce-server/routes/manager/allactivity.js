const express = require('express')

const router = express.Router();
const allActivityCtrl = require('@/controllers/manager/allActivityCtrl');
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');

router.get('/allactivities', auth.checkAdmin, logger.writeLogMiddleware, allActivityCtrl.getAllActivity);
router.post('/allactivities', auth.checkAdmin, logger.writeLogMiddleware, allActivityCtrl.updateActivityStatus);


module.exports = router