// db = require('@/config/database')
const db = require('@/config/database')
const getLastDays = require('@/utils/getLastDays')


//处理管理员展示数据的具体逻辑
exports.showData = async (req, res) => {
    console.log("管理员展示数据请求体: ", req.query)
    // 从数据库查询数据
    const [totalUserCountRaw] = await db.query('SELECT COUNT(*) as totalUserCount FROM user')
    const [totalProductCountRaw] = await db.query('SELECT COUNT(*) as totalProductCount FROM product')
    const [totalOrderCountRaw] = await db.query('SELECT COUNT(*) as totalOrderCount FROM \`order\`')
    const [sumOrderAmountRaw] = await db.query('SELECT SUM(total_amount) as sumOrderAmount FROM \`order\`')
    //console.log("总订单金额: ", sumOrderAmountRaw[0])

    // 图表数据
    const xData = getLastDays(6)
    const [orderData] = await db.query('SELECT date(create_time) as date, COUNT(*)as orderCount FROM \`order`\ WHERE status = "已完成" AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date')
    const orderDataNumber = orderData.map(item => item.orderCount).reverse()
    //获取订单金额
    const [saleData] = await db.query('SELECT date(create_time) as date, SUM(total_amount) FROM \`order\` WHERE status = "已完成" AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date')
    const saleDataNumber = saleData.map(item => parseInt(item['SUM(total_amount)'])).reverse()
    const [pieDataRaw] = await db.query(`
        SELECT 
            c.name AS categoryName,
            IFNULL(SUM(od.price * od.quantity), 0) AS value
        FROM \`order\` o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sku ON od.sku_id = sku.sku_id
        JOIN product p ON sku.product_id = p.product_id
        JOIN category c ON p.category_id = c.category_id
        WHERE o.status = '已完成'
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
}