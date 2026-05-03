// db = require('@/config/database')
const db = require('@/config/database')
const getLastDays = require('@/utils/getLastDays')


//处理管理员展示数据的具体逻辑
exports.showData = async (req, res) => {
    console.log("商家展示数据请求体: ", req.query)
    // 从请求体中获取商家ID
    const merchant_id = req.user.user_id
    console.log("商家ID: ", merchant_id)
    //获取商店id
    const [shop_idRaw] = await db.query('SELECT shop_id FROM shop WHERE user_id = ?', [merchant_id])
    const shop_id = shop_idRaw[0].shop_id
    console.log("商店ID: ", shop_id)
    // 从数据库查询数据
    //const [totalUserCountRaw] = await db.query('SELECT COUNT(*) as totalUserCount FROM user')
    const [totalProductCountRaw] = await db.query('SELECT COUNT(*) as totalProductCount FROM product WHERE shop_id = ? AND product_status = "通过"', [shop_id])
    const [totalOrderCountRaw] = await db.query('SELECT COUNT(*) as totalOrderCount FROM \`order\` WHERE user_id = ?', [merchant_id])
    const [waitsendRaw] = await db.query('SELECT COUNT(*) as waitSend FROM \`order\` WHERE user_id = ? AND status = "待发货"', [merchant_id])
    //获取今日订单金额
    const [sumOrderAmountRaw] = await db.query('SELECT SUM(total_amount) as sumOrderAmount FROM \`order\` WHERE user_id = ? AND status IN ("已完成", "退款驳回") AND create_time >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)', [merchant_id])
    //console.log("总订单金额: ", sumOrderAmountRaw[0])

    // 图表数据
    const xData = getLastDays(6)
    const [orderData] = await db.query('SELECT date(create_time) as date, COUNT(*)as orderCount FROM \`order\` WHERE status IN ("已完成", "退款驳回") AND user_id = ? AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date', [merchant_id])
    const orderDataNumber = orderData.map(item => item.orderCount).reverse()
    //获取订单金额
    const [saleData] = await db.query('SELECT date(create_time) as date, SUM(total_amount) FROM \`order\` WHERE status IN ("已完成", "退款驳回") AND user_id = ? AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date', [merchant_id])
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
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE o.status IN ("已完成", "退款驳回") AND s.shop_id = ?
        GROUP BY c.category_id, c.name
        LIMIT 10
    `, [shop_id])
    const pieData = pieDataRaw.map(item => ({
        categoryName: item.categoryName,
        value: parseInt(item.value)
    }));
    // 组织数据
    const showData = {
        waitSend: waitsendRaw[0].waitSend,
        goodsCount: totalProductCountRaw[0].totalProductCount,
        orderCount: totalOrderCountRaw[0].totalOrderCount,
        sumOrderAmount: sumOrderAmountRaw[0].sumOrderAmount || 0,
        xData: xData,
        orderData: orderDataNumber,
        saleData: saleDataNumber,
        pieData: pieData
    }
    console.log("商家展示数据: ", showData)
    // 返回数据
    res.json({ success: true, message: '获取商家展示数据成功', status: 200, data: showData })
}