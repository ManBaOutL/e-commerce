const express = require('express')

const router = express.Router();
const productCtrl = require('@/controllers/merchant/productCtrl');
const auth = require('@/middlewares/auth')
//const logger = require('@/middlewares/loggerMiddleware')


router.get('/products', auth.checkMerchant, productCtrl.getAllProduct);
router.post('/products', auth.checkMerchant, productCtrl.updateProductStatus);


module.exports = router
