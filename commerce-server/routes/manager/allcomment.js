const express = require('express')

const router = express.Router();
const allCommentCtrl = require('@/controllers/manager/allCommentCtrl');
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');

router.get('/allcomments', auth.checkAdmin, logger.writeLogMiddleware, allCommentCtrl.getAllComment);
router.post('/allcomments', auth.checkAdmin, logger.writeLogMiddleware, allCommentCtrl.updateCommentStatus);


module.exports = router