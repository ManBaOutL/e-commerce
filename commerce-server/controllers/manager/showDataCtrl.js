// db = require('@/config/database')
const db = require('@/config/database')
const { getLastDays, getCurrentMonthDays } = require('@/utils/getLastDays')


//处理管理员展示数据的具体逻辑
exports.showData = async (req, res) => {
    console.log("管理员展示数据请求体: ", req.query)
    const { day } = req.query
    const days = parseInt(day) || 7

    // 判断是否为当月模式
    const isMonthMode = days === 31

    // 获取日期范围
    let dateCondition = ''
    if (days === 1) {
        // 当日：今天
        dateCondition = 'AND o.create_time >= CURDATE()'
    } else if (isMonthMode) {
        // 当月：本月1日到今天
        dateCondition = 'AND o.create_time >= DATE_FORMAT(CURDATE(), "%Y-%m-01")'
    } else {
        // 其他：前N天
        dateCondition = `AND o.create_time >= DATE_SUB(CURDATE(), INTERVAL ${days - 1} DAY)`
    }

    // 从数据库查询数据
    const [totalUserCountRaw] = await db.query('SELECT COUNT(*) as totalUserCount FROM user')
    const [totalProductCountRaw] = await db.query('SELECT COUNT(*) as totalProductCount FROM product')
    const [totalOrderCountRaw] = await db.query('SELECT COUNT(*) as totalOrderCount FROM \`order\`')
    const [sumOrderAmountRaw] = await db.query('SELECT SUM(total_amount) as sumOrderAmount FROM \`order\` WHERE status IN ("已完成","待发货", "退款驳回") AND DATE(create_time) = CURDATE()')
    //console.log("总订单金额: ", sumOrderAmountRaw[0])

    // 图表数据
    const xData = isMonthMode ? getCurrentMonthDays() : getLastDays(days)
    const [orderData] = await db.query(`SELECT date(o.create_time) as date, COUNT(*) as orderCount FROM \`order\` o WHERE status IN ("已完成","待发货", "退款驳回") ${dateCondition} GROUP BY date`)
    //const orderDataNumber = orderData.map(item => item.orderCount).reverse()

    const orderMap = {}

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
    const [saleData] = await db.query(`SELECT date(o.create_time) as date, IFNULL(SUM(o.total_amount), 0) as totalAmount FROM \`order\` o WHERE status IN ("已完成","待发货", "退款驳回") ${dateCondition} GROUP BY date`)
    //const saleDataNumber = saleData.map(item => parseInt(item['SUM(total_amount)'])).reverse()
    console.log("订单金额: ", saleData)
    const saleMap = {};

    // 1. 把数据库时间转成【东八区日期】（正确的中国日期） 
    saleData.forEach(item => {
        const date = new Date(item.date);
        const localDateStr = date.toLocaleDateString('zh-CN').replace(/\//g, '-'); // 2026-5-6
        saleMap[localDateStr] = item.totalAmount;
    });

    const realSaleData = recentDays.map(day => saleMap[day] || 0);

    // 获取分类销售数据
    const [pieDataRaw] = await db.query(`
        SELECT 
            c.name AS categoryName,
            IFNULL(SUM(od.price * od.quantity), 0) AS value
        FROM category c
        LEFT JOIN product p ON c.category_id = p.category_id
        LEFT JOIN sku_product sku ON p.product_id = sku.product_id
        LEFT JOIN order_details od ON sku.sku_id = od.sku_id
        LEFT JOIN \`order\` o ON od.order_id = o.order_id
        WHERE (o.order_id IS NULL OR (o.status IN ("已完成","待发货", "退款驳回")))
        GROUP BY c.category_id, c.name
        ORDER BY value DESC
    `);

    // 处理 pieData：取前9位，第10位用"其他"表示
    let pieData = [];
    if (pieDataRaw.length > 0) {
        // 计算总和用于判断是否需要"其他"
        const totalValue = pieDataRaw.reduce((sum, item) => sum + parseFloat(item.value), 0);

        // 获取前10位
        const top10 = pieDataRaw.slice(0, 10);

        // 检查前10位中有多少个值为0
        const zeroCount = top10.filter(item => parseFloat(item.value) === 0).length;

        // 如果前10位中有多个0（超过1个），则只取前9位有值的
        if (zeroCount > 1) {
            // 只取有值的分类
            pieData = top10
                .filter(item => parseFloat(item.value) > 0)
                .map(item => ({
                    name: item.categoryName,
                    value: parseInt(item.value)
                }));
        } else {
            // 正常处理：取前9位，第10位及以后合并为"其他"
            pieData = top10.slice(0, 9).map(item => ({
                name: item.categoryName,
                value: parseInt(item.value)
            }));

            // 如果有第10位及以后的分类，计算它们的总和作为"其他"
            if (pieDataRaw.length > 9) {
                const otherTotal = pieDataRaw.slice(9).reduce((sum, item) => sum + parseFloat(item.value), 0);
                if (otherTotal > 0) {
                    pieData.push({
                        name: '其他',
                        value: parseInt(otherTotal)
                    });
                }
            }
        }
    }

    // 按地区（省）分析消费偏好 - 使用address表的province字段
    const [regionData] = await db.query(`
        SELECT a.province, IFNULL(SUM(o.total_amount), 0) as totalAmount, COUNT(DISTINCT o.order_id) as orderCount
        FROM address a
        LEFT JOIN \`order\` o ON a.user_id = o.user_id AND o.status IN ("已完成", "退款驳回") ${dateCondition}
        WHERE a.is_deleted = 0 AND a.province IS NOT NULL AND a.province != ''
        GROUP BY a.province
        ORDER BY totalAmount DESC
        LIMIT 10
    `);

    // 按用户年龄段分析消费偏好 - 确保返回所有年龄段
    const [ageGroupData] = await db.query(`
        SELECT 
            ageGroups.ageGroup,
            IFNULL(SUM(o.total_amount), 0) as totalAmount,
            IFNULL(userCounts.userCount, 0) as userCount,
            COUNT(DISTINCT o.order_id) as orderCount
        FROM (
            SELECT '未知' as ageGroup UNION ALL
            SELECT '18岁以下' as ageGroup UNION ALL
            SELECT '18-25岁' as ageGroup UNION ALL
            SELECT '26-35岁' as ageGroup UNION ALL
            SELECT '36-45岁' as ageGroup UNION ALL
            SELECT '46-55岁' as ageGroup UNION ALL
            SELECT '55岁以上' as ageGroup
        ) ageGroups
        LEFT JOIN (
            SELECT 
                CASE 
                    WHEN u.age IS NULL OR u.age = 0 THEN '未知'
                    WHEN u.age < 18 THEN '18岁以下'
                    WHEN u.age BETWEEN 18 AND 25 THEN '18-25岁'
                    WHEN u.age BETWEEN 26 AND 35 THEN '26-35岁'
                    WHEN u.age BETWEEN 36 AND 45 THEN '36-45岁'
                    WHEN u.age BETWEEN 46 AND 55 THEN '46-55岁'
                    ELSE '55岁以上'
                END AS ageGroup,
                COUNT(DISTINCT u.user_id) as userCount
            FROM user u
            GROUP BY ageGroup
        ) userCounts ON ageGroups.ageGroup = userCounts.ageGroup
        LEFT JOIN user u ON ageGroups.ageGroup = (
            CASE 
                WHEN u.age IS NULL OR u.age = 0 THEN '未知'
                WHEN u.age < 18 THEN '18岁以下'
                WHEN u.age BETWEEN 18 AND 25 THEN '18-25岁'
                WHEN u.age BETWEEN 26 AND 35 THEN '26-35岁'
                WHEN u.age BETWEEN 36 AND 45 THEN '36-45岁'
                WHEN u.age BETWEEN 46 AND 55 THEN '46-55岁'
                ELSE '55岁以上'
            END
        )
        LEFT JOIN \`order\` o ON u.user_id = o.user_id AND o.status IN ("已完成","待发货", "退款驳回") ${dateCondition}
        GROUP BY ageGroups.ageGroup
        ORDER BY FIELD(ageGroups.ageGroup, '未知', '18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上')
    `);

    // 获取热门商品
    let [hotProducts] = await db.query(`
        SELECT p.name, SUM(od.quantity) as totalQuantity, SUM(od.price * od.quantity) as totalAmount
        FROM order_details od
        JOIN sku_product sku ON od.sku_id = sku.sku_id
        JOIN product p ON sku.product_id = p.product_id
        JOIN \`order\` o ON od.order_id = o.order_id
        WHERE o.status IN ("已完成","待发货", "退款驳回") ${dateCondition}
        GROUP BY p.product_id, p.name
        ORDER BY totalAmount DESC
        LIMIT 10
    `);

    // 如果当前时间范围内热门商品少于5个，补充历史热门商品
    if (hotProducts.length < 5) {
        const [historyHotProducts] = await db.query(`
            SELECT p.name, SUM(od.quantity) as totalQuantity, SUM(od.price * od.quantity) as totalAmount
            FROM order_details od
            JOIN sku_product sku ON od.sku_id = sku.sku_id
            JOIN product p ON sku.product_id = p.product_id
            JOIN \`order\` o ON od.order_id = o.order_id
            WHERE o.status IN ("已完成","待发货", "退款驳回")
            GROUP BY p.product_id, p.name
            ORDER BY totalAmount DESC
            LIMIT 10
        `);

        // 合并去重
        const existingNames = new Set(hotProducts.map(item => item.name));
        historyHotProducts.forEach(item => {
            if (!existingNames.has(item.name) && hotProducts.length < 10) {
                hotProducts.push(item);
                existingNames.add(item.name);
            }
        });
    }

    // 组织数据
    const showData = {
        totalUserCount: totalUserCountRaw[0].totalUserCount,
        totalProductCount: totalProductCountRaw[0].totalProductCount,
        totalOrderCount: totalOrderCountRaw[0].totalOrderCount,
        sumOrderAmount: sumOrderAmountRaw[0].sumOrderAmount || 0,
        xData: xData,
        orderData: realOrderData,
        saleData: realSaleData,
        pieData: pieData,
        // 新增数据
        regionAnalysis: regionData.map(item => ({
            region: item.province,
            totalAmount: parseFloat(item.totalAmount),
            orderCount: parseInt(item.orderCount)
        })),
        ageGroupAnalysis: ageGroupData.map(item => ({
            ageGroup: item.ageGroup,
            totalAmount: parseFloat(item.totalAmount),
            userCount: parseInt(item.userCount),
            orderCount: parseInt(item.orderCount)
        })),
        hotProducts: hotProducts.map(item => ({
            name: item.name,
            totalQuantity: parseInt(item.totalQuantity),
            totalAmount: parseFloat(item.totalAmount)
        }))
    }
    console.log("管理员展示数据: ", showData)
    // 返回数据
    res.json({ success: true, message: '获取管理员展示数据成功', status: 200, data: showData })
}