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
            SELECT COUNT(*) AS total FROM \`order\` o ${where}
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
            FROM \`order\` o
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
            JOIN sku_product sku ON od.sku_id = sku.sku_id
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
    
    // 如果是同意退款（enable），执行完整的逆向资金与资产回滚
    if (operation === 'enable') {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            for (const oid of order_id) {
                // 1. 查询订单信息
                const [orders] = await connection.execute(
                    `SELECT o.order_id, o.total_amount, o.coupon_id, o.user_id as buyer_id 
                     FROM \`order\` o WHERE o.order_id = ? AND o.status = '待审核'`,
                    [oid]
                );
                
                if (orders.length === 0) {
                    throw new Error(`订单 ${oid} 异常或无权操作`);
                }
                
                const orderInfo = orders[0];
                const buyer_id = orderInfo.buyer_id;
                const payAmount = Number(orderInfo.total_amount);
                
                // 2) 订单主表改状态
                await connection.execute(
                    `UPDATE \`order\` SET status = '已退款', RejectReason = NULL WHERE order_id = ?`, 
                    [oid]
                );
                
                // 3) 回滚有效优惠券
                if (orderInfo.coupon_id) {
                    const [coupons] = await connection.execute(
                        `SELECT end_time FROM coupon WHERE coupon_id = ?`, 
                        [orderInfo.coupon_id]
                    );
                    if (coupons.length > 0 && new Date(coupons[0].end_time) >= new Date()) {
                        await connection.execute(
                            `UPDATE coupon SET status = '未使用' WHERE coupon_id = ?`, 
                            [orderInfo.coupon_id]
                        );
                    }
                }
                
                // 4) 资金逆向清算 A：将钱退回到买家的平台余额中
                await connection.execute(
                    `UPDATE user SET balance = balance + ? WHERE user_id = ?`, 
                    [payAmount, buyer_id]
                );
                
                // 5) 资金逆向清算 B：从商家的余额里把钱扣回来
                const [merchantIncomes] = await connection.execute(`
                    SELECT sh.user_id as target_merchant_id, SUM(od.quantity * od.price) as income
                    FROM order_details od 
                    JOIN sku_product s ON od.sku_id = s.sku_id 
                    JOIN product p ON s.product_id = p.product_id 
                    JOIN shop sh ON p.shop_id = sh.shop_id
                    WHERE od.order_id = ?
                    GROUP BY sh.user_id
                `, [oid]);
                
                for (let row of merchantIncomes) {
                    await connection.execute(
                        `UPDATE user SET balance = balance - ? WHERE user_id = ?`, 
                        [Number(row.income).toFixed(2), row.target_merchant_id]
                    );
                }
                
                // 6) 获取明细，精确回滚库存与销量
                const [details] = await connection.execute(
                    `SELECT od.sku_id, od.quantity, s.product_id 
                     FROM order_details od 
                     JOIN sku_product s ON od.sku_id = s.sku_id 
                     WHERE od.order_id = ?`,
                    [oid]
                );
                
                for (let item of details) {
                    // a. 加回规格层级库存
                    await connection.execute(
                        `UPDATE sku_product SET stock = stock + ? WHERE sku_id = ?`, 
                        [item.quantity, item.sku_id]
                    );
                    
                    // b. 加回商品层级库存，并安全扣减销量 (GREATEST 防负数)
                    await connection.execute(
                        `UPDATE product 
                         SET stock = stock + ?, 
                             sales = GREATEST(CAST(sales AS SIGNED) - ?, 0) 
                         WHERE product_id = ?`, 
                        [item.quantity, item.quantity, item.product_id]
                    );
                }
            }
            
            await connection.commit();
            return res.json({
                status: 200,
                success: true,
                message: '管理员已同意退款，货款已全额退至买家平台余额',
                data: true
            });
            
        } catch (err) {
            await connection.rollback();
            console.error('管理员退款处理异常:', err);
            return res.status(500).json({
                status: 500,
                success: false,
                message: err.message || '操作失败',
                data: false
            });
        } finally {
            connection.release();
        }
    }
    
    // 驳回退款：只更新订单状态
    console.log("operation", operations)
    const updateSql = `UPDATE \`order\` SET ${operations.field} = ? WHERE order_id in (${order_id.map(() => '?').join(',')})`;
    console.log(updateSql, [operations.value, ...order_id])
    await db.query(updateSql, [operations.value, ...order_id]);
    return res.json({
        status: 200,
        success: true,
        message: '操作成功',
        data: true
    });
}
