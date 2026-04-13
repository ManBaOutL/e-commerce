const express = require('express')
const router = express.Router()

router.use('/manager', require('./showData'))

module.exports = router
