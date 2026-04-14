const db = require('@/config/database');

// 切换商品收藏状态 (如果未收藏则加入，已收藏则取消)
exports.toggleFavorite = async (req, res) => {
    // 从鉴权中间件解析出来的 req.user 中拿到当前登录用户的 ID
    const userId = req.user.user_id; 
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({ status: 400, success: false, message: '缺少商品ID' });
    }

    try {
        // 先检查是否已经收藏过
        const [exist] = await db.execute(
            'SELECT * FROM favorite WHERE user_id = ? AND product_id = ?', 
            [userId, product_id]
        );

        if (exist.length > 0) {
            // 已收藏，则执行取消收藏
            await db.execute('DELETE FROM favorite WHERE user_id = ? AND product_id = ?', [userId, product_id]);
            return res.json({ status: 200, success: true, message: '已取消收藏', data: { isFavorite: false } });
        } else {
            // 未收藏，则加入收藏
            await db.execute('INSERT INTO favorite (user_id, product_id) VALUES (?, ?)', [userId, product_id]);
            return res.json({ status: 200, success: true, message: '收藏成功', data: { isFavorite: true } });
        }
    } catch (err) {
        console.error('收藏操作错误：', err.message);
        res.status(500).json({ status: 500, success: false, message: '服务器内部错误' });
    }
};

// 检查当前用户是否收藏了某个商品 (用于详情页渲染那颗红心)
exports.checkFavorite = async (req, res) => {
    const userId = req.user.user_id;
    const productId = req.params.id;

    try {
        const [exist] = await db.execute(
            'SELECT * FROM favorite WHERE user_id = ? AND product_id = ?', 
            [userId, productId]
        );
        const isFavorite = exist.length > 0;
        res.json({ status: 200, success: true, data: { isFavorite }, message: '查询成功' });
    } catch (err) {
        res.status(500).json({ status: 500, success: false, message: '服务器内部错误' });
    }
};