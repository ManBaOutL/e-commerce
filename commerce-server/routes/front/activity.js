const express = require('express');
const router = express.Router();
const activityController = require('@/controllers/front/activityCtrl');

// 商品列表
router.get('/list', activityController.getPublicActivities);

module.exports = router;