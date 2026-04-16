const express = require('express')

const router = express.Router();
const allCategoryCtrl = require('@/controllers/manager/allCategoryCtrl');
const auth = require('@/middlewares/auth')

router.get('/allcategories', auth.checkAdmin, allCategoryCtrl.getAllCategory);
router.post('/allcategories', allCategoryCtrl.updateCategoryStatus);


module.exports = router