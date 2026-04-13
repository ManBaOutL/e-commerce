const express = require('express')
const router = express.Router()
const db = require('../database')

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

function getLastDays(needDays = 7) {
    let days = []
    for (let i = needDays - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const day = date.getDate() // 取出几号
        days.push(day + '日')
    }
    return days
}

router.get('/showData', async (req, res) => {
    console.log("管理员展示数据请求体: ", req.query)
    // 从数据库查询数据
    const [totalUserCountRaw] = await db.query('SELECT COUNT(*) as totalUserCount FROM user')
    const [totalProductCountRaw] = await db.query('SELECT COUNT(*) as totalProductCount FROM product')
    const [totalOrderCountRaw] = await db.query('SELECT COUNT(*) as totalOrderCount FROM orders')
    const [sumOrderAmountRaw] = await db.query('SELECT SUM(total_amount) as sumOrderAmount FROM orders')
    //console.log("总订单金额: ", sumOrderAmountRaw[0])

    // 图表数据
    const xData = getLastDays(6)
    const [orderData] = await db.query('SELECT date(create_time) as date, COUNT(*)as orderCount FROM orders WHERE order_status = "已完成" AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date')
    const orderDataNumber = orderData.map(item => item.orderCount).reverse()
    //获取订单金额
    const [saleData] = await db.query('SELECT date(create_time) as date, SUM(total_amount) FROM orders WHERE order_status = "已完成" AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date')
    const saleDataNumber = saleData.map(item => parseInt(item['SUM(total_amount)'])).reverse()
    const [pieDataRaw] = await db.query(`
        SELECT 
            c.name AS categoryName,
            IFNULL(SUM(od.price * od.quantity), 0) AS value
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN product p ON od.product_id = p.product_id
        JOIN category c ON p.category_id = c.category_id
        WHERE o.order_status = '已完成'
        GROUP BY c.category_id, c.name
        LIMIT 10
    `);
    const pieData = pieDataRaw.map(item => ({
        name: item.categoryName,
        value: parseInt(item.value)
    }));
    // 组织数据
    const showData = {
        totalUserCount: totalUserCountRaw[0].totalUserCount,
        totalProductCount: totalProductCountRaw[0].totalProductCount,
        totalOrderCount: totalOrderCountRaw[0].totalOrderCount,
        sumOrderAmount: sumOrderAmountRaw[0].sumOrderAmount,
        xData: xData,
        orderData: orderDataNumber,
        saleData: saleDataNumber,
        pieData: pieData
    }
    console.log("管理员展示数据: ", showData)
    // 返回数据
    res.json({ success: true, message: '获取管理员展示数据成功', status: 200, data: showData })
})

module.exports = router
