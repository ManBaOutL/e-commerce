const schedule = require('node-schedule');
const db = require('../config/database'); // 确保这里的路径能正确指向你的数据库配置

/**
 * 启动订单相关的定时任务
 */
exports.startOrderTasks = () => {
    console.log(' [定时任务] 订单超时扫描服务已启动...');

    // 设定规则：每分钟的第 0 秒执行一次 (Cron 表达式: '0 * * * * *')
    schedule.scheduleJob('0 * * * * *', async () => {
        try {
            // 1. 查找所有状态为 '待支付'，且创建时间在 30 分钟之前的订单
            // 使用 DATE_SUB(NOW(), INTERVAL 30 MINUTE) 动态计算时间线
            const [expiredOrders] = await db.execute(`
                SELECT order_id, user_id, coupon_id 
                FROM \`order\` 
                WHERE status = '待支付' 
                AND create_time <= DATE_SUB(NOW(), INTERVAL 60 MINUTE)
            `);

            if (expiredOrders.length === 0) return; // 没有超时订单，静默退出

            console.log(`[定时任务] 扫描到 ${expiredOrders.length} 个超时订单，开始执行自动取消...`);

            // 2. 遍历取消这些订单 (挨个处理，防止一个报错影响其他)
            for (let order of expiredOrders) {
                await cancelSingleOrder(order.order_id, order.user_id, order.coupon_id);
            }

        } catch (err) {
            console.error('🚨 [定时任务] 订单超时扫描异常:', err);
        }
    });
};

/**
 * 核心：取消单个订单的事务逻辑 (复用你之前写的取消订单逻辑)
 */
async function cancelSingleOrder(order_id, user_id, coupon_id) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 🌟 再次锁行确认状态，防止在扫描和执行的这几毫秒间，用户恰好付款了！
        const [checkOrders] = await connection.execute(
            `SELECT status FROM \`order\` WHERE order_id = ? FOR UPDATE`,
            [order_id]
        );

        if (checkOrders.length === 0 || checkOrders[0].status !== '待支付') {
            await connection.rollback();
            return; 
        }

        // 1. 改状态为「已取消」
        await connection.execute(`UPDATE \`order\` SET status = '已取消', RejectReason = '超时未支付，系统自动取消' WHERE order_id = ?`, [order_id]);

        // 2. 退还优惠券
        if (coupon_id) {
            await connection.execute(`UPDATE coupon SET status = '未使用' WHERE coupon_id = ?`, [coupon_id]);
        }

        // 3. 查出订单明细
        const [details] = await connection.execute(
            `SELECT od.sku_id, od.quantity, s.product_id 
             FROM order_details od 
             JOIN sku_product s ON od.sku_id = s.sku_id 
             WHERE od.order_id = ?`,
            [order_id]
        );

        // 4. 退还底层双表库存
        for (let item of details) {
            await connection.execute(`UPDATE sku_product SET stock = stock + ? WHERE sku_id = ?`, [item.quantity, item.sku_id]);
            await connection.execute(`UPDATE product SET stock = stock + ? WHERE product_id = ?`, [item.quantity, item.product_id]);
        }

        // 提交事务
        await connection.commit();
        console.log(` [系统自动取消] 订单号: ${order_id} 处理成功，资产已回滚。`);

    } catch (err) {
        await connection.rollback();
        console.error(` [系统自动取消] 订单号: ${order_id} 处理失败:`, err);
    } finally {
        connection.release();
    }
}