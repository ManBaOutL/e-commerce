const db = require('@/config/database');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
const formatIsoDate = require('@/utils/date').formatIsoDate;

exports.getAllOrder = [paginationMiddleware, async (req, res) => {
    const { userId, orderId, status, year, month, day } = req.query;
    const { currentPage, pageSize, offset, formatResult } = req.pagination;

    console.log("筛选条件:", req.query)
    console.log("当前页:", currentPage, "每页数量:", pageSize)

    try {
        const conditions = [];
        const params = [];

        if (orderId) {
            conditions.push('o.order_id = ?');
            params.push(orderId);
        }
        if (userId) {
            conditions.push('o.user_id = ?');
            params.push(userId);
        }
        if (status) {
            conditions.push('o.status = ?');
            params.push(status);
        }
        if (year) {
            conditions.push('YEAR(o.create_time) = ?');
            params.push(year);
        }
        if (month) {
            conditions.push('MONTH(o.create_time) = ?');
            params.push(month);
        }
        if (day) {
            conditions.push('DAY(o.create_time) = ?');
            params.push(day);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [countResult] = await db.query(`
            SELECT COUNT(*) AS total FROM orders o ${where}
        `, params);
        const total = countResult[0].total;

        const [orders] = await db.query(`
            SELECT 
                o.order_id AS orderId,
                o.user_id AS userId,
                o.total_amount AS money,
                o.status AS status,
                o.create_time AS createTime,
                o.RefundReason AS userRefundReason,
                o.RejectReason AS merchantReason
            FROM orders o
            ${where}
            ORDER BY o.create_time DESC
            LIMIT ? OFFSET ?
        `, [...params, pageSize, offset]);

        const orderIds = orders.map(o => o.orderId);
        if (!orderIds.length) {
            return res.json({
                status: 200,
                success: true,
                data: { orderList: [], pagination: formatResult(0) }
            });
        }

        const [goodsData] = await db.query(`
            SELECT 
                od.order_id AS orderId,
                p.name AS name,
                s.name AS merchant,
                od.price AS price,
                sku.name AS size,
                od.quantity AS num
            FROM order_details od
            JOIN skuproduct sku ON od.sku_id = sku.sku_id
            JOIN product p ON sku.product_id = p.product_id
            JOIN shop s ON p.shop_id = s.shop_id
            WHERE od.order_id IN (${orderIds.map(() => '?').join(',')})
        `, orderIds);

        const goodsMap = {};
        goodsData.forEach(item => {
            if (!goodsMap[item.orderId]) goodsMap[item.orderId] = [];
            goodsMap[item.orderId].push({
                name: item.name,
                merchant: item.merchant,
                price: item.price,
                size: item.size || '默认规格',
                num: item.num
            });
        });

        const orderList = orders.map(o => ({
            orderId: o.orderId,
            userId: o.userId,
            money: o.money,
            status: o.status,
            createTime: formatIsoDate(o.createTime),
            goodList: goodsMap[o.orderId] || [],
            userRefundReason: o.userRefundReason || '',
            merchantReason: o.merchantReason || ''
        }));
        //console.log(orderList)

        return res.json({
            status: 200,
            success: true,
            message: '获取订单成功',
            data: {
                orderList,
                pagination: formatResult(total)
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: '服务器错误',
            data: {
                orderList: [],
                pagination: { currentPage, pageSize, total: 0, totalPages: 0 }
            }
        });
    }
}];


exports.postOrder = async (req, res) => {
    console.log(req.body)
    if (!req.body.order_id || !req.body.operation) {
        return res.json({
            status: 400,
            success: false,
            message: '操作类型不能为空',
            data: false
        });
    }
    const { order_id, operation } = req.body;
    console.log(order_id, operation)
    const operationMap = {
        disable: { field: 'status', value: '退款驳回' },   // 驳回退款
        enable: { field: 'status', value: '已退款' },   // 运行退款
    };
    const operations = operationMap[operation];
    if (!operations) {
        return res.json({
            status: 400,
            success: false,
            message: '操作类型错误',
            data: false
        });
    }
    console.log("operation", operations)
    const updateSql = `UPDATE orders SET ${operations.field} = ? WHERE order_id in (${order_id.map(() => '?').join(',')})`;
    console.log(updateSql, [operations.value, ...order_id])
    await db.query(updateSql, [operations.value, ...order_id]);
    return res.json({
        status: 200,
        success: true,
        message: '操作成功',
        data: true
    });
}
