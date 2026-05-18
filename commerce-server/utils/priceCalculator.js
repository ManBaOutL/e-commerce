const db = require('@/config/database');

/**
 * 🌟 核心活动计费引擎
 * @param {Array} items - 购物车或结算页传来的商品列表 [{ sku_id, category_id, price, quantity }]
 * @returns {Object} - 返回 { totalAmount(最终总价), originalTotal(原总价), finalItems(处理后的商品明细) }
 */
exports.calculateFinalPrice = async (items) => {
    // 1. 根据活动时间自动判断活动是否在活跃期
    const [activities] = await db.query(`
        SELECT * FROM activity 
        WHERE start_time <= NOW() 
          AND end_time >= NOW()
    `);

    // 将活动按类型分类，方便后续按优先级执行
    const flashSales = activities.filter(a => a.act_type === '秒杀');
    const fullReductions = activities.filter(a => a.act_type === '满减');
    const discounts = activities.filter(a => a.act_type === '折扣');

    // 2. 深拷贝原始商品，并初始化 actual_price (实际结算单价)
    let finalItems = items.map(item => ({
        ...item,
        original_price: Number(item.price), // 记录原价
        actual_price: Number(item.price),   // 初始结算价等于原价
        is_flash_sale: false,               // 标记是否参与了秒杀
        applied_activities: []              // 记录该商品享受了哪些活动（用于前端展示）
    }));

    // ==========================================
    // 🚀 规则一：秒杀优先（独占逻辑）
    // ==========================================
    finalItems.forEach(item => {
        // goods_type_id = 0 代表全品类通用，或者匹配专属分类
        const applicableFlash = flashSales.find(a => a.goods_type_id == 0 || a.goods_type_id == item.category_id);
        
        if (applicableFlash) {
            // 秒杀价直接覆盖原价
            item.actual_price = Number(applicableFlash.max_discount_value);
            item.is_flash_sale = true; // 🌟 核心：打上秒杀标记，后续的满减和折扣将跳过该商品
            item.applied_activities.push(applicableFlash.name);
        }
    });

    // ==========================================
    // 🚀 规则二：满减核算（按比例分摊算法）
    // ==========================================
    fullReductions.forEach(fr => {
        // 过滤出【未参与秒杀】且【符合该满减分类】的商品
        let applicableItems = finalItems.filter(item => 
            !item.is_flash_sale && (fr.goods_type_id == 0 || fr.goods_type_id == item.category_id)
        );

        // 计算这些适用商品的总价值（按当前 actual_price 算）
        let totalApplicableAmount = applicableItems.reduce((sum, item) => sum + (item.actual_price * item.quantity), 0);

        // 判断是否达到满减门槛 (min_amount)
        if (totalApplicableAmount >= Number(fr.min_amount)) {
            const reductionAmount = Number(fr.max_discount_value); // 要减掉的总金额 (如 50元)

            // 🌟 企业级核心算法：按金额比例分摊减免额
            applicableItems.forEach(item => {
                const itemTotal = item.actual_price * item.quantity; // 当前商品总额
                const ratio = itemTotal / totalApplicableAmount; // 占比 (如 30%)
                const itemReduction = reductionAmount * ratio; // 该商品分摊到的减免额 (如减 15元)
                
                // 更新单价：(当前总额 - 分摊减免额) / 数量
                item.actual_price = Number(((itemTotal - itemReduction) / item.quantity).toFixed(2));
                item.applied_activities.push(fr.name);
            });
        }
    });

    // ==========================================
    // 🚀 规则三：折扣核算（满减后继续打折）
    // ==========================================
    discounts.forEach(disc => {
        // 同样过滤出【未参与秒杀】且【符合分类】的商品
        let applicableItems = finalItems.filter(item => 
            !item.is_flash_sale && (disc.goods_type_id == 0 || disc.goods_type_id == item.category_id)
        );

        applicableItems.forEach(item => {
            // max_discount_value 存放的是折扣率 (如 0.85 代表 85折)
            item.actual_price = Number((item.actual_price * Number(disc.max_discount_value)).toFixed(2));
            item.applied_activities.push(disc.name);
        });
    });

    // ==========================================
    // 🚀 扫尾：防止出现负数 & 汇总金额
    // ==========================================
    let totalAmount = 0;
    let originalTotal = 0;

    finalItems.forEach(item => {
        // 极端防呆设计：单价最低不能低于 0.01 元
        if (item.actual_price <= 0) item.actual_price = 0.01;
        
        totalAmount += item.actual_price * item.quantity;
        originalTotal += item.original_price * item.quantity;
    });

    return {
        originalTotal: Number(originalTotal.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)), // 这才是用户真正要支付的钱！
        finalItems // 这里面包含了最终的 actual_price，要存进 order_details
    };
};