const db = require('@/config/database');

// 获取我的优惠券列表
exports.getMyCoupons = async (req, res) => {
    // 从 Token 中解析出 user_id
    const user_id = req.user.user_id || req.user.id;
    
    try {
        // 查出该用户的所有优惠券，并按状态和过期时间排序
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