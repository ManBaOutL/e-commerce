const express = require('express')
const router = express.Router()

router.use('/merchant', require('./showData'))
router.use('/merchant', require('./info'))
router.use('/merchant', require('./product'))
router.use('/merchant', require('./order'))

module.exports = router