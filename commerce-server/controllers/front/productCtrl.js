const db = require('@/config/database');
const fs = require('fs');
const path = require('path');
const { calculateFinalPrice } = require('@/utils/priceCalculator');

// 1. 获取商品列表 (注入活动试算逻辑)
exports.getList = async (req, res) => {
    try {
        const {
            page = 1, pageSize = 10,
            keyword, category_id, shop_id,
            start_time, end_time,
            minPrice, maxPrice,
            sort_field = 'product_id', sort_order = 'desc'
        } = req.query;

        const offset = (Number(page) - 1) * Number(pageSize);
        let queryParams = [];

        // 🌟 必须查出 category_id，这是匹配活动的前提！
        const selectFields = "product_id AS id, name, price, img AS image, sales, stock, create_time, category_id";
        let sql = `SELECT ${selectFields} FROM product WHERE product_status = '通过'`;

        if (category_id) {
            const [allCategories] = await db.execute('SELECT category_id, parent_id FROM category');
            const getDescendantIds = (targetId, categories) => {
                let ids = [Number(targetId)];
                const children = categories.filter(c => c.parent_id === Number(targetId));
                for (const child of children) {
                    ids = ids.concat(getDescendantIds(child.category_id, categories));
                }
                return ids;
            };
            const allTargetIds = getDescendantIds(category_id, allCategories);
            const placeholders = allTargetIds.map(() => '?').join(',');
            sql += ` AND category_id IN (${placeholders})`;
            queryParams.push(...allTargetIds);
        }
        if (keyword) {
            sql += ` AND name LIKE ?`;
            queryParams.push(`%${keyword}%`);
        }

        const countSql = sql.replace(selectFields, 'COUNT(*) as total');
        const [[{ total }]] = await db.execute(countSql, queryParams);

        const sortMap = { 'id': 'product_id', 'sales': 'sales', 'price': 'price', 'created_time': 'create_time' };
        const actualSortField = sortMap[sort_field] || 'product_id';
        const actualSortOrder = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        sql += ` ORDER BY ${actualSortField} ${actualSortOrder} LIMIT ? OFFSET ?`;
        queryParams.push(Number(pageSize).toString(), offset.toString());

        const [rows] = await db.execute(sql, queryParams);

        for (let row of rows) {
            const folderPath = `/upload/product/img/${row.id}/`;
            const absDirPath = path.join(process.cwd(), 'public', folderPath);
            if (fs.existsSync(absDirPath)) {
                const files = fs.readdirSync(absDirPath);
                const mainFile = files.find(f => f.startsWith('1.'));
                if (mainFile) row.image = folderPath + mainFile;
            }
        }

        // ==========================================
        // 🌟 重点修改：将列表数据放入计费引擎试算展示价格
        // ==========================================
        if (rows.length > 0) {
            // 构造成引擎能识别的格式（单件购买试算）
            const itemsToCalc = rows.map(row => ({
                product_id: row.id,
                category_id: row.category_id,
                price: row.price,
                quantity: 1
            }));

            // 跑一遍引擎
            const calcResult = await calculateFinalPrice(itemsToCalc);

            // 将引擎算出的活动价和标签，组装回给前端的列表里
            calcResult.finalItems.forEach((calcItem, index) => {
                rows[index].original_price = calcItem.original_price;
                rows[index].actual_price = calcItem.actual_price;
                rows[index].is_flash_sale = calcItem.is_flash_sale;
                rows[index].activities = calcItem.applied_activities; // 存入活动名称数组
            });
        }

        res.json({ status: 200, success: true, data: { list: rows, total: Number(total) }, message: '获取成功' });
    } catch (err) {
        console.error('获取商品列表错误：', err.message);
        res.status(500).json({ status: 500, success: false, message: '服务器内部错误' });
    }
};

// 获取分类树 (无限极递归版本)
exports.getCategoryTree = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT category_id AS id, name, parent_id FROM category');

        // 1. 初始化 Map 和最终的 Tree 数组
        const map = {};
        const tree = [];

        // 2. 将所有节点存入 map，并为每个节点提前挂载一个空的 children 数组
        // 这样后面通过 map[id] 就能瞬间定位到任意一个节点
        rows.forEach(item => {
            map[item.id] = { ...item, children: [] };
        });

        // 3. 再次遍历数据，建立父子关系
        rows.forEach(item => {
            const node = map[item.id];

            if (item.parent_id === 0) {
                // 如果 parent_id 是 0，说明它是最顶层的根分类，直接推入 tree
                tree.push(node);
            } else {
                // 如果它有父级，通过 map 瞬间找到它爸爸，把自己塞进爸爸的 children 里
                const parentNode = map[item.parent_id];
                if (parentNode) {
                    parentNode.children.push(node);
                }
            }
        });

        // 清理掉空的 children 数组
        // 前端 UI 库（如 Element Plus 的 Cascader）如果看到 children 是个空数组 []，
        // 会弹出一个没有内容的空白级联面板。所以我们要把没有子分类的 children 删掉。
        const cleanEmptyChildren = (nodes) => {
            nodes.forEach(node => {
                if (node.children.length === 0) {
                    delete node.children; // 没有子集，直接删掉这个属性
                } else {
                    cleanEmptyChildren(node.children); // 递归清理下一层
                }
            });
        };
        cleanEmptyChildren(tree);

        res.json({ status: 200, success: true, data: tree, message: '获取成功' });
    } catch (err) {
        console.error('获取分类树错误：', err.message);
        res.status(500).json({ status: 500, success: false, message: '服务器内部错误' });
    }
};

// 2. 获取商品详情 (追加可用活动明细)
exports.getDetail = async (req, res) => {
    const productId = req.params.id;
    try {
        const [products] = await db.execute(
            `SELECT p.product_id as id, p.name, p.description, p.price, p.price as original_price, 
                    p.stock as stock_count, p.sales as sales_count, p.img, p.rate, p.category_id,
                    p.shop_id, -- 🌟 查出 shop_id
                    sh.name as shop_name, -- 🌟 联表查出店铺名
                    c.name as category_name
             FROM product p 
             LEFT JOIN category c ON p.category_id = c.category_id
             LEFT JOIN shop sh ON p.shop_id = sh.shop_id -- 🌟 关联店铺表
             WHERE p.product_id = ? AND p.product_status = '通过'`,
            [productId]
        );

        if (products.length === 0) return res.status(404).json({ success: false, message: '商品不存在或已下架' });
        let productInfo = products[0];

        // ==========================================
        // 🌟 核心新增：动态计算真实的商品评分 (rate)
        // ==========================================
        const [rateResult] = await db.execute(
            `SELECT AVG(rating) as avg_rate 
             FROM \`comment\` 
             WHERE product_id = ? AND parent_id IS NULL AND comment_status = '正常'`,
            [productId]
        );

        // 如果没有评论，默认给 5.0 分满分；如果有评论，算出平均分并保留 1 位小数
        const realRate = rateResult[0].avg_rate ? Number(rateResult[0].avg_rate).toFixed(1) : 5.0;
        productInfo.rate = Number(realRate);

        // 顺手把最新算出来的真实评分异步更新回 product 表，这样外面的商品列表页也能展示最新评分
        db.execute(`UPDATE product SET rate = ? WHERE product_id = ?`, [realRate, productId]).catch(err => {
            console.error('异步更新商品评分失败:', err);
        });

        // 处理图片逻辑 (保持你原有的逻辑)
        const folderPath = `/upload/product/img/${productId}/`;
        const absDirPath = path.join(process.cwd(), 'public', folderPath);
        let main_image = '';
        let sub_images = [];
        if (fs.existsSync(absDirPath)) {
            const files = fs.readdirSync(absDirPath);
            const mainFile = files.find(f => f.startsWith('1.'));
            if (mainFile) main_image = folderPath + mainFile;
            for (let i = 2; i <= 4; i++) {
                const subFile = files.find(f => f.startsWith(`${i}.`));
                if (subFile) sub_images.push(folderPath + subFile);
            }
        }
        productInfo.main_image = main_image;
        productInfo.sub_images = sub_images;
        productInfo.detail_images = [main_image, ...sub_images].filter(Boolean);

        // 处理 SKU
        const [skus] = await db.execute(`SELECT sku_id, name as spec_name, act_price, stock FROM sku_product WHERE product_id = ?`, [productId]);
        const spec_groups = {};
        const sku_list = {};
        skus.forEach(sku => {
            const specValues = sku.spec_name.split(/[\s\-]+/);
            const skuKey = specValues.join('|');
            sku_list[skuKey] = {
                sku_id: sku.sku_id, price: Number(sku.act_price), original_price: Number(sku.act_price), stock_count: Number(sku.stock)
            };
            specValues.forEach((val, index) => {
                const groupKey = `spec_${index}`;
                if (!spec_groups[groupKey]) spec_groups[groupKey] = { name: index === 0 ? '款式' : '规格', options: [] };
                const existOpt = spec_groups[groupKey].options.find(opt => opt.value === val);
                if (!existOpt) spec_groups[groupKey].options.push({ value: val, stock_count: sku.stock });
                else existOpt.stock_count += sku.stock;
            });
        });
        productInfo.spec_groups = spec_groups;
        productInfo.sku_list = sku_list;

        // ==========================================
        // 🌟 重点修改：查出该商品可用的所有进行中活动
        // ==========================================
        const [activities] = await db.query(`
            SELECT act_id, name, act_type, rule, max_discount_value, min_amount, start_time, end_time 
            FROM activity 
            WHERE 
            start_time <= NOW() 
            AND end_time >= NOW()
            AND (goods_type_id = 0 OR goods_type_id = ?) 
        `, [productInfo.category_id]); // 0是全场通用，或者是专属分类

        // 分类存放，方便前端在详情页画不同样式的UI
        productInfo.active_campaigns = {
            flashSale: activities.find(a => a.act_type === '秒杀') || null,
            otherActivities: activities.filter(a => a.act_type !== '秒杀')
        };

        res.json({ status: 200, success: true, data: productInfo, message: '获取成功' });
    } catch (err) {
        console.error('获取详情错误：', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};

//  获取商品评论 (productCtrl.js)
exports.getComments = async (req, res) => {
    const productId = req.params.id;
    try {
        // 🌟 核心：把刚刚新增的 5 个追评字段也 SELECT 出来
        const [comments] = await db.execute(
            `SELECT c.review_id as id, c.rating as score, c.comment as comment_text, 
                    DATE_FORMAT(c.create_time, '%Y-%m-%d %H:%i') as created_at,
                    u.username, u.img as user_avatar, c.parent_id,
                    c.images, 
                    c.is_appended, c.append_content, c.append_images, c.append_days
             FROM \`comment\` c
             JOIN user u ON c.user_id = u.user_id
             WHERE c.product_id = ? AND c.comment_status = '正常' AND c.parent_id IS NULL
             ORDER BY c.create_time DESC`,
            [productId]
        );

        for (let i = 0; i < comments.length; i++) {
            // 1. 处理首评图片字符串转数组
            if (comments[i].images) {
                comments[i].images = comments[i].images.split(',');
            } else {
                comments[i].images = [];
            }

            // 🌟 2. 处理追评图片字符串转数组
            if (comments[i].append_images) {
                comments[i].append_images = comments[i].append_images.split(',');
            } else {
                comments[i].append_images = [];
            }

            // 3. 处理商家回复
            const [replies] = await db.execute(
                `SELECT comment FROM \`comment\` WHERE parent_id = ? LIMIT 1`,
                [comments[i].id]
            );
            if (replies.length > 0) {
                comments[i].merchant_reply = replies[0].comment;
            }
        }

        res.json({ status: 200, success: true, data: comments });
    } catch (err) {
        console.error('获取评论错误：', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};