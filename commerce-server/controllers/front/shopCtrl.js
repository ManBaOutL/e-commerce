const db = require('@/config/database');
const fs = require('fs');
const path = require('path');
const { calculateFinalPrice } = require('@/utils/priceCalculator');

// 1. 获取店铺基础信息
exports.getShopInfo = async (req, res) => {
    const shopId = req.params.id;
    try {
        const [shops] = await db.execute(
            `SELECT shop_id, name, description, DATE_FORMAT(create_time, '%Y-%m-%d') as create_time, user_id 
             FROM shop 
             WHERE shop_id = ?`,
            [shopId]
        );
        if (shops.length === 0) return res.status(404).json({ success: false, message: '店铺不存在' });
        console.log('店铺信息：', shops[0]);
        
        res.json({ success: true, status: 200, data: shops[0] });
    } catch (err) {
        console.error('获取店铺信息异常', err);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

// 2. 获取店铺商品列表 (带活动引擎)
exports.getShopProducts = async (req, res) => {
    const shopId = req.params.id;
    try {
        // 查询该店铺下已上架的商品
        const [rows] = await db.execute(
            `SELECT product_id AS id, name, price, img AS image, sales, stock, create_time, category_id
             FROM product 
             WHERE shop_id = ? AND product_status = '通过'
             ORDER BY create_time DESC`,
            [shopId]
        );

        // 动态扫描商品主图
        for (let row of rows) {
            const folderPath = `/upload/product/img/${row.id}/`;
            const absDirPath = path.join(process.cwd(), 'public', folderPath);
            row.image = ''; 
            if (fs.existsSync(absDirPath)) {
                const files = fs.readdirSync(absDirPath);
                const mainFile = files.find(f => f.startsWith('1.'));
                if (mainFile) row.image = folderPath + mainFile;
            }
        }

        // 🌟 重点：经过计费引擎，让店铺页的商品也展示红色的秒杀/满减价！
        if (rows.length > 0) {
            const itemsToCalc = rows.map(row => ({
                product_id: row.id,
                category_id: row.category_id,
                price: row.price,
                quantity: 1 
            }));

            const calcResult = await calculateFinalPrice(itemsToCalc);
            
            calcResult.finalItems.forEach((calcItem, index) => {
                rows[index].original_price = calcItem.original_price;
                rows[index].actual_price = calcItem.actual_price;
                rows[index].is_flash_sale = calcItem.is_flash_sale;
                rows[index].activities = calcItem.applied_activities;
            });
        }

        res.json({ success: true, status: 200, data: rows });
    } catch (err) {
        console.error('获取店铺商品异常', err);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};