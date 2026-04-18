const express = require('express')

const router = express.Router();
const allActivityCtrl = require('@/controllers/manager/allActivityCtrl');
const auth = require('@/middlewares/auth')

router.get('/allactivities', auth.checkAdmin, allActivityCtrl.getAllActivity);
router.post('/allactivities', allActivityCtrl.updateActivityStatus);


module.exports = router