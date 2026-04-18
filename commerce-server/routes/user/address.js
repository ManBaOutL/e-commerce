const express = require('express');
const router = express.Router();
const addressController = require('@/controllers/user/addressCtrl');
const authMiddleware = require('@/middlewares/auth');
const loggerMiddleware = require('@/middlewares/loggerMiddleware');


// 地址相关接口
router.post('/add', authMiddleware.checkUser, loggerMiddleware.writeUserLogMiddleware, addressController.addAddress);
router.get('/list', addressController.getList);
router.post('/update', authMiddleware.checkUser, addressController.updateAddress);
router.post('/delete', authMiddleware.checkUser, addressController.deleteAddress);
router.post('/setDefault', authMiddleware.checkUser, addressController.setDefault);

module.exports = router;
