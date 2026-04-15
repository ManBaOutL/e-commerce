const express = require('express')
const router = express.Router()

router.use('/manager', require('./showData'))
router.use('/manager', require('./userData'))
router.use('/manager', require('./allProducts'))
router.use('/manager', require('./allorder'))


module.exports = router
