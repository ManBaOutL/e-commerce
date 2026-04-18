const express = require('express')
const router = express.Router()

router.use('/manager', require('./showData'))
router.use('/manager', require('./userData'))
router.use('/manager', require('./allProducts'))
router.use('/manager', require('./allorder'))
router.use('/manager', require('./allcategory'))
router.use('/manager', require('./allcoupons'))
router.use('/manager', require('./allactivity'))
router.use('/manager', require('./allcomment'))
router.use('/manager', require('./alloperationlog'))




module.exports = router
