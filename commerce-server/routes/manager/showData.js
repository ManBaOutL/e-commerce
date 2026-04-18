const express = require('express')
const router = express.Router()
const auth = require('@/middlewares/auth')
const logger = require('@/middlewares/loggerMiddleware');



// 管理员展示数据类型定义
// interface managerShowData {
//     //总体数据
//     totalUserCount: number
//     totalProductCount: number
//     totalOrderCount: number
//     sumOrderAmount: number
//     // 图表数据
//     xData: string[]
//     orderData: number[]
//     saleData: number[]
//     pieData: { categoryName: string, value: number }[]
// }
const showDataCtrl = require('@/controllers/manager/showDataCtrl')
router.get('/showData', auth.checkAdmin, logger.writeLogMiddleware, showDataCtrl.showData)

module.exports = router
