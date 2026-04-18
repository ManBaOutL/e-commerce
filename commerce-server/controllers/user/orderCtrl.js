const db = require('@/config/database');
const fs = require('fs');
const path = require('path');

// 1. 创建并支付订单 (兼容购物车和直接购买)
exports.createOrder = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    // 🌟 新增解析 direct_buy 参数
    const { cart_ids, direct_buy, address_id, coupon_id, total_amount } = req.body;
    
    const order_id = Date.now().toString().slice(0, -3) + Math.floor(Math.random() * 1000);

    try {
        // 1. 插入订单主表
        await db.execute(
            `INSERT INTO \`order\` (order_id, total_amount, status, user_id, address_id, coupon_id, create_time) 
             VALUES (?, ?, '待支付', ?, ?, ?, NOW())`,
            [order_id, total_amount, user_id, address_id, coupon_id || null]
        );

        // 2. 判断是购物车结算还是直接购买
        if (cart_ids && cart_ids.length > 0) {
            // --- 走购物车链路 ---
            const placeholders = cart_ids.map(() => '?').join(',');
            const [cartItems] = await db.execute(`
                SELECT c.sku_id, c.quantity, s.act_price 
                FROM cart c JOIN sku_product s ON c.sku_id = s.sku_id 
                WHERE c.cart_id IN (${placeholders}) AND c.user_id = ?
            `, [...cart_ids, user_id]);

            for (let item of cartItems) {
                await db.execute(`INSERT INTO order_details (order_id, sku_id, quantity, price) VALUES (?, ?, ?, ?)`, [order_id, item.sku_id, item.quantity, item.act_price]);
                await db.execute(`UPDATE sku_product SET stock = stock - ? WHERE sku_id = ?`, [item.quantity, item.sku_id]);
            }
            // 清空购物车
            await db.execute(`DELETE FROM cart WHERE cart_id IN (${placeholders}) AND user_id = ?`, [...cart_ids, user_id]);

        } else if (direct_buy && direct_buy.sku_id) {
            // --- 走直接购买链路 ---
            // 直接将单件商品写入订单明细，并扣库存（无需操作购物车表）
            await db.execute(`INSERT INTO order_details (order_id, sku_id, quantity, price) VALUES (?, ?, ?, ?)`, 
                [order_id, direct_buy.sku_id, direct_buy.quantity, direct_buy.price]);
            await db.execute(`UPDATE sku_product SET stock = stock - ? WHERE sku_id = ?`, 
                [direct_buy.quantity, direct_buy.sku_id]);
        }

        // 3. 核销优惠券
        if (coupon_id) {
            await db.execute(`UPDATE coupon SET status = '已使用' WHERE coupon_id = ?`, [coupon_id]);
        }

        res.json({ success: true, message: '支付成功，订单已生成', status: 200, data: { order_id } });
    } catch (err) {
        console.error('创建订单异常:', err);
        res.status(500).json({ success: false, message: '下单失败', status: 500, data: null });
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
                   c.name as coupon_name, c.discount_value
            FROM \`order\` o
            LEFT JOIN order_details od ON o.order_id = od.order_id
            LEFT JOIN sku_product s ON od.sku_id = s.sku_id
            LEFT JOIN product p ON s.product_id = p.product_id
            LEFT JOIN coupon c ON o.coupon_id = c.coupon_id
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
                // 🌟 核心：根据 product_id 动态读取真实的商品主图
                let main_image = '';
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
                    main_image: main_image // 👈 把扫出来的图片路径挂载给前端
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

// 5. 取消订单 (并回滚库存与优惠券)
exports.cancelOrder = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { order_id } = req.body;

    try {
        // 1. 先验证订单存不存在，并且是不是“待支付”状态，顺便把 coupon_id 查出来
        const [orders] = await db.execute(
            `SELECT coupon_id FROM \`order\` WHERE order_id = ? AND user_id = ? AND status = '待支付'`,
            [order_id, user_id]
        );

        if (orders.length === 0) {
            return res.status(400).json({ success: false, message: '订单无法取消或不存在', status: 400, data: null });
        }

        const coupon_id = orders[0].coupon_id;

        // 2. 将订单状态改为“已取消”
        await db.execute(
            `UPDATE \`order\` SET status = '已取消' WHERE order_id = ?`,
            [order_id]
        );

        // 3. 归还使用的优惠券
        if (coupon_id) {
            await db.execute(
                `UPDATE coupon SET status = '未使用' WHERE coupon_id = ?`,
                [coupon_id]
            );
        }

        // 4. 查出订单明细，把扣除的库存加回去
        const [details] = await db.execute(
            `SELECT sku_id, quantity FROM order_details WHERE order_id = ?`,
            [order_id]
        );

        for (let item of details) {
            await db.execute(
                `UPDATE sku_product SET stock = stock + ? WHERE sku_id = ?`,
                [item.quantity, item.sku_id]
            );
        }

        res.json({ success: true, message: '订单已取消，资产已原路退回', status: 200, data: null });
    } catch (err) {
        console.error('取消订单异常:', err);
        res.status(500).json({ success: false, message: '系统异常，取消失败', status: 500, data: null });
    }
};