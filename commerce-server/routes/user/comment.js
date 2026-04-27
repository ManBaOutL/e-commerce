const express = require('express');
const router = express.Router();
const commentController = require('@/controllers/user/commentCtrl');
const authMiddleware = require('@/middlewares/auth');

// 商品评论
router.post('/add', authMiddleware.checkUser, commentController.addComment);
router.post('/append', authMiddleware.checkUser, commentController.appendComment);
router.get('/list', authMiddleware.checkUser, commentController.getMyComments);
router.post('/delete', authMiddleware.checkUser, commentController.deleteComment);

module.exports = router;
