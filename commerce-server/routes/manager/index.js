const express = require('express')
const router = express.Router()

router.use('/manager', require('./showData'))
router.use('/manager', require('./userData'))
router.use('/manager', require('./allProducts'))
router.use('/manager', require('./allorder'))
router.use('/manager', require('./allcategory'))
router.use('/manager', require('./allcoupons'))



module.exports = router
