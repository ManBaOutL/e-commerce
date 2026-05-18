const db = require('@/config/database');

// 根据时间自动更新优惠券状态
const updateCouponStatus = async () => {
    try {
        // 更新未使用的优惠券：当前时间 > 结束时间 -> 改为"已过期"
        await db.execute(`
            UPDATE coupon 
            SET status = '已过期' 
            WHERE status = '未使用' 
              AND end_time < NOW()
        `);

        console.log('[优惠券状态更新] 已根据时间自动更新优惠券状态');
    } catch (err) {
        console.error('[优惠券状态更新] 更新失败:', err.message);
    }
};

// 获取我的优惠券列表
exports.getMyCoupons = async (req, res) => {
    // 从 Token 中解析出 user_id
    const user_id = req.user.user_id || req.user.id;
    
    try {
        // 先根据时间自动更新优惠券状态
        await updateCouponStatus();

        // 然后查出该用户的所有优惠券，并按状态和过期时间排序
        const [coupons] = await db.execute(
            `SELECT coupon_id, name, type, discount_value, min_order_amount, 
                    DATE_FORMAT(start_time, '%Y-%m-%d') as start_time, 
                    DATE_FORMAT(end_time, '%Y-%m-%d') as end_time, 
                    status 
             FROM coupon 
             WHERE user_id = ? 
             ORDER BY status ASC, end_time ASC`,
            [user_id]
        );

        res.json({ status: 200, success: true, data: coupons, message: '获取成功' });
    } catch (err) {
        console.error('获取优惠券错误：', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};

// 获取可用的优惠券（用于结算页）
exports.getAvailableCoupons = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { total_amount } = req.query;

    try {
        // 先根据时间自动更新优惠券状态
        await updateCouponStatus();

        // 查询可用的优惠券
        const [coupons] = await db.execute(
            `SELECT coupon_id, name, type, discount_value, min_order_amount, 
                    DATE_FORMAT(end_time, '%Y-%m-%d') as end_time 
             FROM coupon 
             WHERE user_id = ? 
               AND status = '未使用' 
               AND min_order_amount <= ? 
               AND end_time >= NOW()
             ORDER BY discount_value DESC`,
            [user_id, total_amount]
        );

        res.json({ status: 200, success: true, data: coupons, message: '获取成功' });
    } catch (err) {
        console.error('获取可用优惠券错误：', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};