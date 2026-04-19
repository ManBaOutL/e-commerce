const express = require('express')

const router = express.Router();
const allCategoryCtrl = require('@/controllers/manager/allCategoryCtrl');
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');

router.get('/allcategories', auth.checkAdmin, logger.writeLogMiddleware, allCategoryCtrl.getAllCategory);
router.post('/allcategories', auth.checkAdmin, logger.writeLogMiddleware, allCategoryCtrl.updateCategoryStatus);


module.exports = router