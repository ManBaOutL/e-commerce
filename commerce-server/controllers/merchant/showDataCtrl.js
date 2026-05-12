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
    const [totalOrderCountRaw] = await db.query(`SELECT COUNT(*) as totalOrderCount 
        FROM \`order\` 
        JOIN order_details od ON \`order\`.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE s.user_id = ?`, [merchant_id])
    const [waitsendRaw] = await db.query(`SELECT COUNT(*) as waitSend 
        FROM \`order\` 
        JOIN order_details od ON \`order\`.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE s.user_id = ? AND \`order\`.status = "待发货"`, [merchant_id])
    //获取今日订单金额
    const [sumOrderAmountRaw] = await db.query(`SELECT SUM(od.price * od.quantity) as sumOrderAmount 
        FROM \`order\` as o
        join order_details od on o.order_id = od.order_id
        join sku_product sp on od.sku_id = sp.sku_id
        join product p on sp.product_id = p.product_id
        join shop s on p.shop_id = s.shop_id
        WHERE s.user_id = ? AND o.status IN ("已完成", "退款驳回") AND DATE(o.create_time) = CURDATE() `, [merchant_id])
    //console.log("总订单金额: ", sumOrderAmountRaw[0])

    // 图表数据
    const xData = getLastDays(7)
    const [orderData] = await db.query(`SELECT 
        date(o.create_time) as date, 
        COUNT(*)as orderCount 
        FROM \`order\` as o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE s.user_id = ? AND o.status IN ("已完成", "退款驳回") AND o.create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date`, [merchant_id])
    //console.log("订单数据: ", orderData)
    //const orderDataNumber = orderData.map(item => item.orderCount)

    const orderMap = {};

    // 1. 把数据库时间转成【东八区日期】（正确的中国日期）
    orderData.forEach(item => {
        const date = new Date(item.date);
        const localDateStr = date.toLocaleDateString('zh-CN').replace(/\//g, '-'); // 2026-5-6
        orderMap[localDateStr] = item.orderCount;
    });

    // 2. 生成最近 N 天的【中国日期】（和 xData 一一对应）
    const recentDays = xData.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (xData.length - 1 - i));
        return d.toLocaleDateString('zh-CN').replace(/\//g, '-');
    });

    // 3. 自动生成等长数组
    const realOrderData = recentDays.map(day => orderMap[day] || 0);

    //获取订单金额
    const [saleData] = await db.query(`SELECT date(o.create_time) as date, SUM(o.total_amount) 
        FROM \`order\` as o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE o.status IN ("已完成", "退款驳回") AND s.user_id = ? AND o.create_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date`, [merchant_id])
    //const saleDataNumber = saleData.map(item => parseInt(item['SUM(o.total_amount)']))
    console.log("销售数据: ", saleData)

    const saleMap = {};

    // 1. 把数据库时间转成【东八区日期】（正确的中国日期） 
    saleData.forEach(item => {
        const date = new Date(item.date);
        const localDateStr = date.toLocaleDateString('zh-CN').replace(/\//g, '-'); // 2026-5-6
        saleMap[localDateStr] = item['SUM(o.total_amount)'];
    });

    const realSaleData = recentDays.map(day => saleMap[day] || 0);

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
        name: item.categoryName,
        value: parseInt(item.value)
    }));
    // 组织数据
    const showData = {
        waitSend: waitsendRaw[0].waitSend,
        goodsCount: totalProductCountRaw[0].totalProductCount,
        orderCount: totalOrderCountRaw[0].totalOrderCount,
        sumOrderAmount: sumOrderAmountRaw[0].sumOrderAmount || 0,
        xData: xData,
        orderData: realOrderData,
        saleData: realSaleData,
        pieData: pieData
    }
    console.log("商家展示数据: ", showData)
    // 返回数据
    res.json({ success: true, message: '获取商家展示数据成功', status: 200, data: showData })
}