const db = require('@/config/database');
const fs = require('fs');
const path = require('path');

// 1. 创建并支付订单 (加入完整事务机制)
exports.createOrder = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { cart_ids, direct_buy, address_id, coupon_id, total_amount } = req.body;
    
    // 订单号生成
    const order_id = Date.now().toString().slice(0, -3) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    // 🌟 开启事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. 插入订单主表
        await connection.execute(
            `INSERT INTO \`order\` (order_id, total_amount, status, user_id, address_id, coupon_id, create_time) 
             VALUES (?, ?, '待支付', ?, ?, ?, NOW())`,
            [order_id, total_amount, user_id, address_id, coupon_id || null]
        );

        // 2. 判断是购物车结算还是直接购买
        if (cart_ids && cart_ids.length > 0) {
            const placeholders = cart_ids.map(() => '?').join(',');
            const [cartItems] = await connection.execute(`
                SELECT c.sku_id, c.quantity, s.act_price, s.product_id 
                FROM cart c JOIN sku_product s ON c.sku_id = s.sku_id 
                WHERE c.cart_id IN (${placeholders}) AND c.user_id = ?
            `, [...cart_ids, user_id]);

            for (let item of cartItems) {
                // 写明细
                await connection.execute(`INSERT INTO order_details (order_id, sku_id, quantity, price) VALUES (?, ?, ?, ?)`, [order_id, item.sku_id, item.quantity, item.act_price]);
                
                // 扣双表库存 (表名修正为 product)
                await connection.execute(`UPDATE sku_product SET stock = stock - ? WHERE sku_id = ?`, [item.quantity, item.sku_id]);
                await connection.execute(`UPDATE product SET stock = stock - ? WHERE product_id = ?`, [item.quantity, item.product_id]);
            }
            // 清空购物车
            await connection.execute(`DELETE FROM cart WHERE cart_id IN (${placeholders}) AND user_id = ?`, [...cart_ids, user_id]);

        } else if (direct_buy && direct_buy.sku_id) {
            // 写明细
            await connection.execute(`INSERT INTO order_details (order_id, sku_id, quantity, price) VALUES (?, ?, ?, ?)`, 
                [order_id, direct_buy.sku_id, direct_buy.quantity, direct_buy.price]);
                
            // 扣双表库存 (表名修正为 product)
            await connection.execute(`UPDATE sku_product SET stock = stock - ? WHERE sku_id = ?`, [direct_buy.quantity, direct_buy.sku_id]);
            await connection.execute(`UPDATE product SET stock = stock - ? WHERE product_id = ?`, [direct_buy.quantity, direct_buy.product_id]);
        }

        // 3. 核销优惠券
        if (coupon_id) {
            await connection.execute(`UPDATE coupon SET status = '已使用' WHERE coupon_id = ?`, [coupon_id]);
        }

        // 🌟 事务提交（全部成功，正式写入数据库）
        await connection.commit();
        res.json({ success: true, message: '下单成功，订单已生成', status: 200, data: { order_id } });

    } catch (err) {
        // 🌟 事务回滚（任何一步报错，全部撤销）
        await connection.rollback();
        console.error('创建订单异常:', err);
        res.status(500).json({ success: false, message: '下单失败', status: 500, data: null });
    } finally {
        // 释放连接
        connection.release();
    }
};
// 2. 获取我的订单列表 (包含订单明细、优惠券信息和商品主图)
exports.getOrderList = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    try {
        const [rows] = await db.execute(`
            SELECT o.order_id, o.total_amount, o.status, DATE_FORMAT(o.create_time, '%Y-%m-%d %H:%i:%s') as create_time,
                   od.quantity, od.price,
                   p.name as product_name, p.product_id,
                   c.name as coupon_name, c.discount_value,
                   cm.review_id, cm.is_appended -- 🌟 新增：查出该订单下对应商品的评价信息
            FROM \`order\` o
            LEFT JOIN order_details od ON o.order_id = od.order_id
            LEFT JOIN sku_product s ON od.sku_id = s.sku_id
            LEFT JOIN product p ON s.product_id = p.product_id
            LEFT JOIN coupon c ON o.coupon_id = c.coupon_id
            LEFT JOIN \`comment\` cm ON cm.order_id = o.order_id AND cm.product_id = p.product_id -- 🌟 新增：左连接评论表
            WHERE o.user_id = ?
            ORDER BY o.create_time DESC
        `, [user_id]);
        const ordersMap = {};
        rows.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    order_id: row.order_id,
                    total_amount: row.total_amount,
                    status: row.status,
                    create_time: row.create_time,
                    coupon: row.coupon_name ? { name: row.coupon_name, discount: row.discount_value } : null,
                    details: []
                };
            }
            if (row.product_name) {
                let main_image = '';
                // 文件夹路径改为 product，保持与前面上传路径一致
                const folderPath = `/upload/product/img/${row.product_id}/`;
                const absDirPath = path.join(process.cwd(), 'public', folderPath);
                
                if (fs.existsSync(absDirPath)) {
                    const files = fs.readdirSync(absDirPath);
                    const mainFile = files.find(f => f.startsWith('1.'));
                    if (mainFile) main_image = folderPath + mainFile;
                }

                ordersMap[row.order_id].details.push({
                    product_id: row.product_id,
                    product_name: row.product_name,
                    price: row.price,
                    quantity: row.quantity,
                    main_image: main_image,
                    review_id: row.review_id || null, 
                    is_appended: row.is_appended || 0 
                });
            }
        });

        const orderList = Object.values(ordersMap);
        res.json({ success: true, message: '获取成功', status: 200, data: orderList });
    } catch (err) {
        console.error('获取订单异常:', err);
        res.status(500).json({ success: false, message: '获取订单失败', status: 500, data: null });
    }
};

// 3. 继续支付待支付的订单
exports.payOrder = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { order_id } = req.body;

    try {
        // 3. 继续支付待支付的订单
        // 🌟 忽略发货流程，支付成功直接标记为 '已完成'
        const [result] = await db.execute(
            `UPDATE \`order\` SET status = '已完成' WHERE order_id = ? AND user_id = ? AND status = '待支付'`,
            [order_id, user_id]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '支付成功', status: 200, data: null });
        } else {
            res.status(400).json({ success: false, message: '订单状态不可支付或订单不存在', status: 400, data: null });
        }
    } catch (err) {
        console.error('支付订单异常:', err);
        res.status(500).json({ success: false, message: '支付异常', status: 500, data: null });
    }
};

// 4. 用户申请退款 (修正字段名)
exports.applyRefund = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    // 🌟 这里改为接收 refundReason
    const { order_id, refundReason } = req.body;

    if (!refundReason || refundReason.trim() === '') {
        return res.status(400).json({ success: false, message: '请填写退款原因', status: 400, data: null });
    }

    try {
        // 🌟 SQL 里的字段也改为 refundReason
        const [result] = await db.execute(
            `UPDATE \`order\` SET status = '申请退款', refundReason = ? WHERE order_id = ? AND user_id = ? AND status = '已完成'`,
            [refundReason, order_id, user_id]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '退款申请已提交，等待商家审核', status: 200, data: null });
        } else {
            res.status(400).json({ success: false, message: '该订单当前无法申请退款', status: 400, data: null });
        }
    } catch (err) {
        console.error('申请退款异常:', err);
        res.status(500).json({ success: false, message: '系统异常，申请失败', status: 500, data: null });
    }
};

// 5. 取消订单 (并回滚库存与优惠券，加入事务)
exports.cancelOrder = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { order_id } = req.body;

    // 🌟 开启事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [orders] = await connection.execute(
            `SELECT coupon_id FROM \`order\` WHERE order_id = ? AND user_id = ? AND status = '待支付'`,
            [order_id, user_id]
        );

        if (orders.length === 0) {
            await connection.rollback(); // 提前结束必须回滚
            connection.release();
            return res.status(400).json({ success: false, message: '订单无法取消或不存在', status: 400, data: null });
        }

        const coupon_id = orders[0].coupon_id;

        // 改状态
        await connection.execute(`UPDATE \`order\` SET status = '已取消' WHERE order_id = ?`, [order_id]);

        // 还优惠券
        if (coupon_id) {
            await connection.execute(`UPDATE coupon SET status = '未使用' WHERE coupon_id = ?`, [coupon_id]);
        }

        // 查明细
        const [details] = await connection.execute(
            `SELECT od.sku_id, od.quantity, s.product_id 
             FROM order_details od 
             JOIN sku_product s ON od.sku_id = s.sku_id 
             WHERE od.order_id = ?`,
            [order_id]
        );

        // 加双表库存 (表名修正为 product)
        for (let item of details) {
            await connection.execute(`UPDATE sku_product SET stock = stock + ? WHERE sku_id = ?`, [item.quantity, item.sku_id]);
            await connection.execute(`UPDATE product SET stock = stock + ? WHERE product_id = ?`, [item.quantity, item.product_id]);
        }

        // 🌟 事务提交
        await connection.commit();
        res.json({ success: true, message: '订单已取消，资产已原路退回', status: 200, data: null });

    } catch (err) {
        // 🌟 事务回滚
        await connection.rollback();
        console.error('取消订单异常:', err);
        res.status(500).json({ success: false, message: '系统异常，取消失败', status: 500, data: null });
    } finally {
        connection.release();
    }
};