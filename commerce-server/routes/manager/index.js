const express = require('express')
const router = express.Router()

router.use('/manager', require('./showData'))
router.use('/manager', require('./userData'))


module.exports = router
