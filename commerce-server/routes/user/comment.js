const express = require('express');
const router = express.Router();
const commentController = require('@/controllers/user/commentCtrl');

// 商品评论
router.post('/add',  commentController.addComment);

module.exports = router;
