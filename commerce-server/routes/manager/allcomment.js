const express = require('express')

const router = express.Router();
const allCommentCtrl = require('@/controllers/manager/allCommentCtrl');
const auth = require('@/middlewares/auth')

router.get('/allcomments', auth.checkAdmin, allCommentCtrl.getAllComment);
router.post('/allcomments', allCommentCtrl.updateCommentStatus);


module.exports = router