const db = require('@/config/database');

/**
 * 获取商品分类及其所有父分类ID
 * @param {number} categoryId - 当前商品的分类ID
 * @param {Array} allCategories - 所有分类数据
 * @returns {Array} - 包含当前分类ID和所有父分类ID的数组
 */
const getCategoryPathIds = (categoryId, allCategories) => {
    const pathIds = [categoryId];
    let currentId = categoryId;
    
    // 向上查找所有父分类
    while (currentId !== 0) {
        const category = allCategories.find(c => c.category_id === currentId);
        if (!category) break;
        if (category.parent_id !== 0) {
            pathIds.push(category.parent_id);
        }
        currentId = category.parent_id;
    }
    
    return pathIds;
};

/**
 * 检查商品是否符合活动分类条件
 * @param {number} goodsTypeId - 活动设置的分类ID (0表示全品类)
 * @param {number} itemCategoryId - 商品的分类ID
 * @param {Array} allCategories - 所有分类数据
 * @returns {boolean} - 是否符合条件
 */
const isCategoryMatch = (goodsTypeId, itemCategoryId, allCategories) => {
    // goods_type_id = 0 代表全品类通用
    if (goodsTypeId === 0) return true;
    
    // 获取商品分类的完整路径（包括所有父分类）
    const categoryPathIds = getCategoryPathIds(itemCategoryId, allCategories);
    
    // 检查活动分类ID是否在商品分类路径中
    return categoryPathIds.includes(goodsTypeId);
};

/**
 * 🌟 核心活动计费引擎
 * @param {Array} items - 购物车或结算页传来的商品列表 [{ sku_id, category_id, price, quantity }]
 * @returns {Object} - 返回 { totalAmount(最终总价), originalTotal(原总价), finalItems(处理后的商品明细) }
 */
exports.calculateFinalPrice = async (items) => {
    // 1. 先获取所有分类数据，用于后续分类层级匹配
    const [categories] = await db.query(`SELECT category_id, parent_id FROM category`);
    
    // 2. 根据活动时间自动判断活动是否在活跃期
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
        // goods_type_id = 0 代表全品类通用，或者匹配专属分类（含子分类）
        const applicableFlash = flashSales.find(a => isCategoryMatch(a.goods_type_id, item.category_id, categories));
        
        if (applicableFlash) {
            // 秒杀价直接覆盖原价
            item.actual_price = Number(applicableFlash.max_discount_value);
            item.is_flash_sale = true; // 🌟 核心：打上秒杀标记，后续的满减和折扣将跳过该商品
            item.applied_activities.push(applicableFlash.name);
        }
    });

    // ==========================================
    // 🚀 规则二：满减核算（每个商品单独享受满减）
    // ==========================================
    fullReductions.forEach(fr => {
        // 过滤出【未参与秒杀】且【符合该满减分类（含子分类）】的商品
        let applicableItems = finalItems.filter(item => 
            !item.is_flash_sale && isCategoryMatch(fr.goods_type_id, item.category_id, categories)
        );

        // 🌟 每个商品单独判断是否达到满减门槛
        applicableItems.forEach(item => {
            const itemTotal = item.actual_price * item.quantity; // 当前商品总额
            
            // 判断该商品是否达到满减门槛
            if (itemTotal >= Number(fr.min_amount)) {
                const reductionAmount = Number(fr.max_discount_value); // 要减掉的金额 (如 50元)
                
                // 更新单价：(当前总额 - 减免额) / 数量
                item.actual_price = Number(((itemTotal - reductionAmount) / item.quantity).toFixed(2));
                item.applied_activities.push(fr.name);
            }
        });
    });

    // ==========================================
    // 🚀 规则三：折扣核算（满减后继续打折）
    // ==========================================
    discounts.forEach(disc => {
        // 同样过滤出【未参与秒杀】且【符合分类（含子分类）】的商品
        let applicableItems = finalItems.filter(item => 
            !item.is_flash_sale && isCategoryMatch(disc.goods_type_id, item.category_id, categories)
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