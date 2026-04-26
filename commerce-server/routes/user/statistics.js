const express = require('express');
const router = express.Router();
const statisticsController = require('@/controllers/user/statisticsCtrl');
const authMiddleware = require('@/middlewares/auth');

// 统计数据
router.get('/list', authMiddleware.checkUser, statisticsController.getUserStatistics);

module.exports = router;
