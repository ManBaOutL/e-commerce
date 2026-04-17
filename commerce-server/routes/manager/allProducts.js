const express = require('express')

const router = express.Router();
const allProductCtrl = require('@/controllers/manager/allProductCtrl');
const auth = require('@/middlewares/auth')

router.get('/allproducts', auth.checkAdmin, allProductCtrl.getAllProduct);
router.post('/allproducts', allProductCtrl.updateProductStatus);


module.exports = router
