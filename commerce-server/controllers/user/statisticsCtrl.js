const db = require('@/config/database');

exports.getUserStatistics = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { timeType, startDate, endDate } = req.query;
    // 🌟 新增：打印前端到底传了什么过来，看终端就能立刻发现 Bug
    // console.log("【统计接口收到参数】:", req.query); 

    try {
        // 1. 根据前端传的 timeType 确定 SQL 的时间过滤范围
        let dateCondition = '';
        let queryParams = [user_id];
        // 🌟 容错处理：如果前端不小心多包了一层 params，我们尝试把它剥出来
        const queryData = req.query.params ? req.query.params : req.query;

        // 🌟 修复：明确指定我们要过滤的是订单表(o)的 create_time
        if (timeType === 'week') {
            dateCondition = 'AND o.create_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (timeType === 'month') {
            dateCondition = 'AND o.create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        } else if (timeType === 'today') {
            dateCondition = 'AND DATE(o.create_time) = CURDATE()';
        } else if (timeType === 'custom' && startDate && endDate) {
            dateCondition = 'AND o.create_time BETWEEN ? AND ?';
            queryParams.push(startDate, endDate + ' 23:59:59');
        }

        // 🌟 统一的有效订单状态
        const validStatus = "('待发货', '已发货', '已完成', '申请退款')";

        // --- 分析任务 1：计算概览 Summary ---
        // 🌟 修复：给单表查询也加上别名 `order` o
        const [summaryRows] = await db.query(`
            SELECT 
                IFNULL(SUM(o.total_amount), 0) as totalAmount,
                COUNT(o.order_id) as totalCount
            FROM \`order\` o
            WHERE o.user_id = ? AND o.status IN ${validStatus} ${dateCondition}
        `, queryParams);

        const totalAmt = Number(summaryRows[0].totalAmount);
        const totalCnt = Number(summaryRows[0].totalCount);
        const avgAmt = totalCnt === 0 ? 0 : (totalAmt / totalCnt).toFixed(2);

        // --- 分析任务 2：计算趋势数据 Trend (按日分组) ---
        // 🌟 修复：给单表查询也加上别名 `order` o，同时 DATE_FORMAT 也使用 o.create_time
        const [trendRows] = await db.query(`
            SELECT 
                DATE_FORMAT(o.create_time, '%m-%d') as dateStr,
                IFNULL(SUM(o.total_amount), 0) as dailyAmount,
                COUNT(o.order_id) as dailyCount
            FROM \`order\` o
            WHERE o.user_id = ? AND o.status IN ${validStatus} ${dateCondition}
            GROUP BY dateStr
            ORDER BY dateStr ASC
        `, queryParams);

        const trend = {
            xAxis: trendRows.map(row => row.dateStr),
            amountData: trendRows.map(row => Number(row.dailyAmount)),
            countData: trendRows.map(row => row.dailyCount)
        };

        // --- 分析任务 3：类目占比 Categories ---
        const [categoryRows] = await db.query(`
            SELECT 
                c.name as name, 
                SUM(od.price * od.quantity) as value
            FROM order_details od
            JOIN \`order\` o ON od.order_id = o.order_id
            JOIN sku_product sp ON od.sku_id = sp.sku_id
            JOIN product p ON sp.product_id = p.product_id
            JOIN category c ON p.category_id = c.category_id
            WHERE o.user_id = ? AND o.status IN ${validStatus} ${dateCondition}
            GROUP BY c.category_id
            ORDER BY value DESC
            LIMIT 5
        `, queryParams);

        // --- 分析任务 4：最高消费排行 Ranking ---
        const [rankRows] = await db.query(`
            SELECT 
                p.name as name, 
                SUM(od.price * od.quantity) as val
            FROM order_details od
            JOIN \`order\` o ON od.order_id = o.order_id
            JOIN sku_product sp ON od.sku_id = sp.sku_id
            JOIN product p ON sp.product_id = p.product_id
            WHERE o.user_id = ? AND o.status IN ${validStatus} ${dateCondition}
            GROUP BY p.product_id
            ORDER BY val DESC
            LIMIT 3
        `, queryParams);

        // 计算排行榜进度条百分比
        const maxRankVal = rankRows.length > 0 ? Number(rankRows[0].val) : 1;
        const ranking = rankRows.map(row => ({
            name: row.name,
            val: Number(row.val),
            percent: Math.round((Number(row.val) / maxRankVal) * 100)
        }));

        res.json({
            success: true,
            status: 200,
            data: {
                summary: {
                    amount: { value: totalAmt.toFixed(2), trend: '-', status: 'up' },
                    count: { value: totalCnt, trend: '-', status: 'up' },
                    avg: { value: avgAmt, trend: '-', status: 'up' }
                },
                trend: trend,
                categories: categoryRows.map(row => ({ name: row.name, value: Number(row.value) })),
                ranking: ranking
            }
        });

    } catch (err) {
        console.error('获取统计数据异常:', err);
        res.status(500).json({ success: false, message: '数据分析计算失败' });
    }
};