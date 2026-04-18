const db = require('@/config/database');
const fs = require('fs');
const path = require('path');

// 1. 添加/取消收藏 (Toggle模式，非常适合商品详情页点星星)
exports.toggleFavorite = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { sku_id } = req.body;

    try {
        const [exist] = await db.execute(`SELECT f_id FROM favorites WHERE user_id = ? AND sku_id = ?`, [user_id, sku_id]);
        
        if (exist.length > 0) {
            await db.execute(`DELETE FROM favorites WHERE f_id = ?`, [exist[0].f_id]);
            res.json({ success: true, message: '已取消收藏', status: 200, data: { is_favorite: false } });
        } else {
            await db.execute(`INSERT INTO favorites (user_id, sku_id) VALUES (?, ?)`, [user_id, sku_id]);
            res.json({ success: true, message: '收藏成功', status: 200, data: { is_favorite: true } });
        }
    } catch (err) {
        console.error('收藏操作异常:', err);
        res.status(500).json({ success: false, message: '操作失败', status: 500 });
    }
};

// 2. 获取我的收藏列表 (联合 SKU 和 Product 表)
exports.getList = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    try {
        // 连表查询：取出收藏记录、SKU价格/库存、以及商品主图/状态
        const [rows] = await db.execute(
            `SELECT f.sku_id AS id, p.product_id, 
                    CONCAT(p.name, ' ', sp.name) AS name, 
                    sp.act_price AS price, p.img AS image, sp.stock, 
                    IF(p.product_status = '通过', 1, 0) AS status, 
                    f.create_time
             FROM favorites f
             JOIN sku_product sp ON f.sku_id = sp.sku_id
             JOIN product p ON sp.product_id = p.product_id
             WHERE f.user_id = ?
             ORDER BY f.create_time DESC`,
            [user_id]
        );

        // 🌟 重点复用：通过 product_id 遍历读取本地真实主图 (1.jpg / 1.png)
        for (let row of rows) {
            const folderPath = `/upload/product/img/${row.product_id}/`;
            const absDirPath = path.join(process.cwd(), 'public', folderPath);
            if (fs.existsSync(absDirPath)) {
                const files = fs.readdirSync(absDirPath);
                const mainFile = files.find(f => f.startsWith('1.'));
                if (mainFile) row.image = folderPath + mainFile;
            }
        }

        res.json({ success: true, message: '获取成功', status: 200, data: rows });
    } catch (err) {
        console.error('获取收藏列表异常:', err);
        res.status(500).json({ success: false, message: '获取失败', status: 500 });
    }
};

// 3. 批量/单条删除收藏
exports.removeFavorite = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { sku_ids } = req.body; // 接收数组 [1, 2, 3]

    if (!sku_ids || !sku_ids.length) return res.status(400).json({ success: false, message: '参数错误' });

    try {
        const placeholders = sku_ids.map(() => '?').join(',');
        await db.execute(
            `DELETE FROM favorites WHERE user_id = ? AND sku_id IN (${placeholders})`,
            [user_id, ...sku_ids]
        );
        res.json({ success: true, message: '移除成功', status: 200 });
    } catch (err) {
        console.error('移除收藏异常:', err);
        res.status(500).json({ success: false, message: '移除失败', status: 500 });
    }
};