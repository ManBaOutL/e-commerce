const express = require('express')

const router = express.Router();
const allProductCtrl = require('@/controllers/manager/allProductCtrl');
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware')


router.get('/allproducts', auth.checkAdmin, logger.writeLogMiddleware, allProductCtrl.getAllProduct);
router.post('/allproducts', auth.checkAdmin, logger.writeLogMiddleware, allProductCtrl.updateProductStatus);


module.exports = router
