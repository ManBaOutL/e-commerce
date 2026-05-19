const db = require('@/config/database')
const { getCurrentMonthDays, getLastDays } = require('@/utils/getLastDays')


exports.showData = async (req, res) => {
    console.log("商家展示数据请求体: ", req.query)

    // 从请求体中获取商家ID
    const merchant_id = req.user.user_id
    console.log("商家ID: ", merchant_id)

    //获取商店id
    const [shop_idRaw] = await db.query('SELECT shop_id FROM shop WHERE user_id = ?', [merchant_id])
    const shop_id = shop_idRaw[0].shop_id
    console.log("商店ID: ", shop_id)

    // 从请求体中获取天数参数，默认为7天
    const daysParam = req.query.day || 7;
    const days = parseInt(daysParam);

    // 判断是否为当月模式
    const isMonthMode = days === 31

    // 获取日期范围
    let dateCondition = ''
    if (days === 1) {
        dateCondition = 'AND o.create_time >= CURDATE()'
    } else if (isMonthMode) {
        dateCondition = 'AND o.create_time >= DATE_FORMAT(CURDATE(), "%Y-%m-01")'
    } else {
        dateCondition = `AND o.create_time >= DATE_SUB(CURDATE(), INTERVAL ${days - 1} DAY)`
    }

    // 从数据库查询数据
    const [totalProductCountRaw] = await db.query('SELECT COUNT(*) as totalProductCount FROM product WHERE shop_id = ? AND product_status = "通过"', [shop_id])
    const [totalOrderCountRaw] = await db.query(`SELECT COUNT(*) as totalOrderCount 
        FROM \`order\` as o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE o.status IN ("已完成", "待发货", "退款驳回") AND s.user_id = ? ${dateCondition}`, [merchant_id])
    const [waitsendRaw] = await db.query(`SELECT COUNT(*) as waitSend 
        FROM \`order\` as o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE s.user_id = ? AND o.status = "待发货"`, [merchant_id])

    //获取订单金额（根据时间范围）
    const [sumOrderAmountRaw] = await db.query(`SELECT SUM(od.price * od.quantity) as sumOrderAmount 
        FROM \`order\` as o
        join order_details od on o.order_id = od.order_id
        join sku_product sp on od.sku_id = sp.sku_id
        join product p on sp.product_id = p.product_id
        join shop s on p.shop_id = s.shop_id
        WHERE s.user_id = ? AND o.status IN ("已完成", "待发货", "退款驳回") ${dateCondition}`, [merchant_id])

    // 图表数据：使用当月天数或指定天数
    const xData = isMonthMode ? getCurrentMonthDays() : getLastDays(days)

    const [orderData] = await db.query(`SELECT 
        date(o.create_time) as date, 
        COUNT(*)as orderCount 
        FROM \`order\` as o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE s.user_id = ? AND o.status IN ("已完成", "待发货", "退款驳回") ${dateCondition} GROUP BY date`, [merchant_id])

    const orderMap = {};

    // 把数据库时间转成【东八区日期】（正确的中国日期）
    orderData.forEach(item => {
        const date = new Date(item.date);
        const localDateStr = date.toLocaleDateString('zh-CN').replace(/\//g, '-');
        orderMap[localDateStr] = item.orderCount;
    });

    const recentDays = xData.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (xData.length - 1 - i));
        return d.toLocaleDateString('zh-CN').replace(/\//g, '-');
    });

    const realOrderData = recentDays.map(day => orderMap[day] || 0);

    //获取订单金额
    const [saleData] = await db.query(`SELECT date(o.create_time) as date, SUM(od.price * od.quantity) as totalAmount
        FROM \`order\` as o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sp ON od.sku_id = sp.sku_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        WHERE o.status IN ("已完成", "待发货", "退款驳回") AND s.user_id = ? ${dateCondition} GROUP BY date`, [merchant_id])

    const saleMap = {};

    saleData.forEach(item => {
        const date = new Date(item.date);
        const localDateStr = date.toLocaleDateString('zh-CN').replace(/\//g, '-');
        saleMap[localDateStr] = item.totalAmount;
    });

    const realSaleData = recentDays.map(day => saleMap[day] || 0);

    // pieData 查询
    const [pieDataRaw] = await db.query(`
        SELECT 
            c.name AS categoryName,
            IFNULL(SUM(od.price * od.quantity), 0) AS value
        FROM category c
        LEFT JOIN product p ON c.category_id = p.category_id
        LEFT JOIN sku_product sku ON p.product_id = sku.product_id
        LEFT JOIN order_details od ON sku.sku_id = od.sku_id
        LEFT JOIN \`order\` o ON od.order_id = o.order_id
        LEFT JOIN shop s ON p.shop_id = s.shop_id
        WHERE s.shop_id = ? AND (o.order_id IS NULL OR (o.status IN ("已完成", "待发货", "退款驳回") ${dateCondition}))
        GROUP BY c.category_id, c.name
        ORDER BY value DESC
    `, [shop_id])
    const pieData = pieDataRaw.map(item => ({
        name: item.categoryName,
        value: parseInt(item.value)
    }));

    // ============ 地区消费偏好分析 ============
    const [regionData] = await db.query(`
        SELECT 
            a.province AS region,
            SUM(od.price * od.quantity) AS totalAmount,
            COUNT(DISTINCT o.order_id) AS orderCount
        FROM \`order\` o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sku ON od.sku_id = sku.sku_id
        JOIN product p ON sku.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        JOIN address a ON o.address_id = a.address_id
        WHERE s.shop_id = ? AND o.status IN ("已完成", "待发货", "退款驳回") ${dateCondition}
        GROUP BY a.province
        ORDER BY totalAmount DESC
        LIMIT 10
    `, [shop_id])

    // ============ 年龄段消费偏好分析 ============
    const [ageGroupData] = await db.query(`
        SELECT 
            CASE 
                WHEN u.age < 18 THEN '18岁以下'
                WHEN u.age BETWEEN 18 AND 25 THEN '18-25岁'
                WHEN u.age BETWEEN 26 AND 35 THEN '26-35岁'
                WHEN u.age BETWEEN 36 AND 45 THEN '36-45岁'
                WHEN u.age BETWEEN 46 AND 55 THEN '46-55岁'
                WHEN u.age > 55 THEN '55岁以上'
                ELSE '未知'
            END AS ageGroup,
            SUM(od.price * od.quantity) AS totalAmount,
            COUNT(DISTINCT u.user_id) AS userCount,
            COUNT(DISTINCT o.order_id) AS orderCount
        FROM \`order\` o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN sku_product sku ON od.sku_id = sku.sku_id
        JOIN product p ON sku.product_id = p.product_id
        JOIN shop s ON p.shop_id = s.shop_id
        JOIN \`user\` u ON o.user_id = u.user_id
        WHERE s.shop_id = ? AND o.status IN ("已完成", "待发货", "退款驳回") ${dateCondition}
        GROUP BY ageGroup
        ORDER BY totalAmount DESC
    `, [shop_id])

    // 组织数据
    const showData = {
        waitSend: waitsendRaw[0].waitSend,
        goodsCount: totalProductCountRaw[0].totalProductCount,
        orderCount: totalOrderCountRaw[0].totalOrderCount,
        sumOrderAmount: sumOrderAmountRaw[0].sumOrderAmount || 0,
        xData: xData,
        orderData: realOrderData,
        saleData: realSaleData,
        pieData: pieData,

        // 新增数据
        regionAnalysis: regionData.map(item => ({
            region: item.region,
            totalAmount: parseFloat(item.totalAmount),
            orderCount: parseInt(item.orderCount)
        })),
        ageGroupAnalysis: ageGroupData.map(item => ({
            ageGroup: item.ageGroup,
            totalAmount: parseFloat(item.totalAmount),
            userCount: parseInt(item.userCount),
            orderCount: parseInt(item.orderCount)
        }))
    }
    console.log("商家展示数据: ", showData)
    // 返回数据
    res.json({ success: true, message: '获取商家展示数据成功', status: 200, data: showData })
}