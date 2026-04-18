
const db = require('@/config/database');
// 添加商品评价
exports.addComment = async (req, res) => {
    // 从前端请求体中拿到必要参数
    const { order_id, product_id, rating, content } = req.body;
    
    // 🌟 企业级规范：user_id 绝不能由前端传，必须从登录 Token 里解析出来！
    // 假设你的鉴权中间件把解析出的用户信息挂载到了 req.user 上
    const user_id = req.user.user_id || req.user.id; 

    try {
        // 1. 安全校验：确认该用户真的有这个订单，并且订单是“已完成”状态
        // 注意：你的数据库 order 是关键字，需要用反引号 `order` 包起来
        const [orders] = await db.execute(
            `SELECT status FROM \`order\` WHERE order_id = ? AND user_id = ?`,
            [order_id, user_id]
        );
        
        if (orders.length === 0) {
            return res.json({ success: false, message: '非法操作，找不到该订单' });
        }
        if (orders[0].status !== '已完成') {
            return res.json({ success: false, message: '只能对已完成的订单进行评价' });
        }

        // 2. 查重校验：确认该订单下的这个商品是否已经评价过了 (防重复提交)
        const [existComments] = await db.execute(
            `SELECT review_id FROM comment WHERE order_id = ? AND product_id = ?`,
            [order_id, product_id]
        );
        if (existComments.length > 0) {
            return res.json({ success: false, message: '您已经评价过该商品了' });
        }

        // 3. 执行插入操作，初始状态设为 '正常'
        await db.execute(
            `INSERT INTO comment (product_id, user_id, order_id, rating, comment, comment_status) 
             VALUES (?, ?, ?, ?, ?, '正常')`,
            [product_id, user_id, order_id, rating, content]
        );

        res.json({ status: 200, success: true, message: '评价发布成功！' });
    } catch (err) {
        console.error('添加评论错误：', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};