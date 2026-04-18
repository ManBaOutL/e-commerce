const express = require('express');
const router = express.Router();
const addressController = require('@/controllers/user/addressCtrl');

// 地址相关接口
router.post('/add', addressController.addAddress);
router.get('/list', addressController.getList);
router.post('/update', addressController.updateAddress);
router.post('/delete', addressController.deleteAddress);
router.post('/setDefault', addressController.setDefault);

module.exports = router;
