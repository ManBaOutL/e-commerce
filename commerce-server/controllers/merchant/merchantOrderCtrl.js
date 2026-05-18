const db = require('@/config/database');

/**
 * 1. 获取商家订单列表
 * @route GET /api/merchant/orders
 */
exports.getMerchantOrderList = async (req, res) => {
    // 获取当前登录的商家 ID
    const merchant_id = req.user.user_id || req.user.id;
    const { status, orderId, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    try {
        let queryParams = [merchant_id];
        let countParams = [merchant_id];
        
        // 通过 product 关联 shop 表，再去匹配商家的 user_id
        let baseWhere = `
            WHERE sh.user_id = ? 
        `;

        // 动态拼接筛选条件
        if (status) {
            baseWhere += ` AND o.status = ?`;
            queryParams.push(status);
            countParams.push(status);
        }
        if (orderId) {
            baseWhere += ` AND o.order_id LIKE ?`;
            queryParams.push(`%${orderId}%`);
            countParams.push(`%${orderId}%`);
        }

        // 1. 查询总条数 (按 order_id 去重，防止分页总数错乱)
        const countSql = `
            SELECT COUNT(DISTINCT o.order_id) as total
            FROM \`order\` o
            JOIN order_details od ON o.order_id = od.order_id
            JOIN sku_product s ON od.sku_id = s.sku_id
            JOIN product p ON s.product_id = p.product_id
            JOIN shop sh ON p.shop_id = sh.shop_id -- 🌟 关键连表
            ${baseWhere}
        `;
        const [[{ total }]] = await db.execute(countSql, countParams);

        // 2. 查询分页数据
        const listSql = `
            SELECT 
                o.order_id as orderId, 
                o.total_amount as money, 
                o.status, 
                DATE_FORMAT(o.create_time, '%Y-%m-%d %H:%i:%s') as createTime,
                o.refundReason as userRefundReason, 
                o.RejectReason as refundRejectReason, 
                u.username as userName, 
                u.phone as userPhone,
                GROUP_CONCAT(p.name SEPARATOR '，') as goodsName,
                CONCAT(IFNULL(a.province,''), IFNULL(a.city,''), IFNULL(a.district,''), IFNULL(a.address,''), IFNULL(a.streetNumber,'')) as address
            FROM \`order\` o
            JOIN order_details od ON o.order_id = od.order_id
            JOIN sku_product s ON od.sku_id = s.sku_id
            JOIN product p ON s.product_id = p.product_id
            JOIN shop sh ON p.shop_id = sh.shop_id -- 🌟 关键连表
            LEFT JOIN user u ON o.user_id = u.user_id
            LEFT JOIN address a ON o.address_id = a.address_id
            ${baseWhere}
            GROUP BY o.order_id
            ORDER BY o.create_time DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(Number(pageSize).toString(), offset.toString());

        const [rows] = await db.execute(listSql, queryParams);

        res.json({
            success: true,
            status: 200,
            data: {
                list: rows,
                pagination: {
                    currentPage: Number(page),
                    pageSize: Number(pageSize),
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / Number(pageSize))
                }
            }
        });

    } catch (err) {
        console.error('获取商家订单异常:', err);
        res.status(500).json({ success: false, message: '获取订单列表失败' });
    }
};

/**
 * 2. 商家审核退款 (同意退款 / 驳回交由管理员仲裁)
 * @route POST /api/merchant/orders/refund/audit
 */
exports.auditRefund = async (req, res) => {
    const merchant_id = req.user.user_id || req.user.id;
    const { order_id, is_agree, reject_reason } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 🌟 核心修复点：鉴权时同样需要 JOIN shop 表来确认归属权，并查出买家 user_id
        const [orders] = await connection.execute(
            `SELECT o.order_id, o.total_amount, o.coupon_id, o.user_id as buyer_id 
             FROM \`order\` o
             JOIN order_details od ON o.order_id = od.order_id
             JOIN sku_product s ON od.sku_id = s.sku_id
             JOIN product p ON s.product_id = p.product_id
             JOIN shop sh ON p.shop_id = sh.shop_id 
             WHERE o.order_id = ? AND o.status = '申请退款' AND sh.user_id = ?
             LIMIT 1`,
            [order_id, merchant_id]
        );

        if (orders.length === 0) {
            throw new Error('订单异常或无权操作');
        }

        if (is_agree === false) {
            // ==========================================
            // 商家拒绝退款：流转为「待审核」，交给管理员
            // ==========================================
            if (!reject_reason) throw new Error('驳回理由不能为空');
            
            await connection.execute(
                `UPDATE \`order\` SET status = '待审核', RejectReason = ? WHERE order_id = ?`,
                [reject_reason, order_id]
            );
            await connection.commit();
            
            return res.json({ 
                success: true, 
                message: '已拒绝退款，该订单将交由平台管理员进行终审', 
                status: 200 
            });

        } else {
            // ==========================================
            // 商家同意退款：执行完整的逆向资金与资产回滚
            // ==========================================
            const orderInfo = orders[0];
            const buyer_id = orderInfo.buyer_id;
            const payAmount = Number(orderInfo.total_amount);

            // 1) 订单主表改状态
            await connection.execute(
                `UPDATE \`order\` SET status = '已退款', RejectReason = NULL WHERE order_id = ?`, 
                [order_id]
            );

            // 2) 回滚有效优惠券
            if (orderInfo.coupon_id) {
                const [coupons] = await connection.execute(`SELECT end_time FROM coupon WHERE coupon_id = ?`, [orderInfo.coupon_id]);
                if (coupons.length > 0 && new Date(coupons[0].end_time) >= new Date()) {
                    await connection.execute(`UPDATE coupon SET status = '未使用' WHERE coupon_id = ?`, [orderInfo.coupon_id]);
                }
            }

            // 3) 资金逆向清算 A：将钱退回到买家的平台余额中
            await connection.execute(
                `UPDATE user SET balance = balance + ? WHERE user_id = ?`, 
                [payAmount, buyer_id]
            );

            //  4) 资金逆向清算 B：从商家的余额里把钱扣回来
            const [merchantIncomes] = await connection.execute(`
                SELECT sh.user_id as target_merchant_id, SUM(od.quantity * od.price) as income
                FROM order_details od 
                JOIN sku_product s ON od.sku_id = s.sku_id 
                JOIN product p ON s.product_id = p.product_id 
                JOIN shop sh ON p.shop_id = sh.shop_id
                WHERE od.order_id = ?
                GROUP BY sh.user_id
            `, [order_id]);

            for (let row of merchantIncomes) {
                await connection.execute(
                    `UPDATE user SET balance = balance - ? WHERE user_id = ?`, 
                    [Number(row.income).toFixed(2), row.target_merchant_id]
                );
            }

            // 5) 获取明细，精确回滚库存与销量
            const [details] = await connection.execute(
                `SELECT od.sku_id, od.quantity, s.product_id 
                 FROM order_details od 
                 JOIN sku_product s ON od.sku_id = s.sku_id 
                 WHERE od.order_id = ?`,
                [order_id]
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

            await connection.commit();
            return res.json({ 
                success: true, 
                message: `已同意退款，¥${payAmount.toFixed(2)} 货款已全额退至买家平台余额`, 
                status: 200 
            });
        }

    } catch (err) {
        await connection.rollback();
        console.error('退款审核处理异常:', err);
        res.status(500).json({ success: false, message: err.message || '操作失败' });
    } finally {
        connection.release();
    }
};

/**
 * 3. 商家订单发货
 * @route POST /api/merchant/orders/ship
 */
exports.shipOrder = async (req, res) => {
    const merchant_id = req.user.user_id || req.user.id;
    const { order_id } = req.body;

    try {
        // 确保状态是“待发货”，并且只能发自己商铺的订单
        // 关键修复：通过 shop 表关联查询商家ID，而不是直接使用 product.user_id
        const [orders] = await db.execute(
            `SELECT o.order_id 
             FROM \`order\` o
             JOIN order_details od ON o.order_id = od.order_id
             JOIN sku_product s ON od.sku_id = s.sku_id
             JOIN product p ON s.product_id = p.product_id
             JOIN shop sh ON p.shop_id = sh.shop_id
             WHERE o.order_id = ? AND o.status = '待发货' AND sh.user_id = ?
             LIMIT 1`,
            [order_id, merchant_id]
        );

        if (orders.length === 0) {
            return res.status(400).json({ success: false, message: '订单无法发货或无权操作' });
        }

        // 执行发货
        await db.execute(
            `UPDATE \`order\` SET status = '已发货' WHERE order_id = ?`,
            [order_id]
        );

        res.json({ success: true, message: '发货成功', status: 200 });
    } catch (err) {
        console.error('发货异常:', err);
        res.status(500).json({ success: false, message: '发货操作失败' });
    }
};