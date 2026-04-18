const db = require('@/config/database');
const fs = require('fs');
const path = require('path');

// 1. 获取商品列表 (完美适配前端 queryParams)
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

        // 🌟 重点修改 1：把需要的字段抽成变量，并新增 create_time
        const selectFields = "product_id AS id, name, price, img AS image, sales, stock, create_time";
        let sql = `SELECT ${selectFields} 
                   FROM product
                   WHERE product_status = '通过'`;

        // 支持无限极递归的分类筛选
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
        if (minPrice) {
            sql += ` AND price >= ?`;
            queryParams.push(minPrice);
        }
        if (maxPrice) {
            sql += ` AND price <= ?`;
            queryParams.push(maxPrice);
        }
        if (start_time && end_time) {
            sql += ` AND create_time BETWEEN ? AND ?`;
            queryParams.push(`${start_time} 00:00:00`, `${end_time} 23:59:59`);
        }

        // 查总数 (分页用)
        // 🌟 重点修改 2：使用上面定义的 selectFields 进行精准替换，防止报错
        const countSql = sql.replace(selectFields, 'COUNT(*) as total');
        const [[{ total }]] = await db.execute(countSql, queryParams);

        // 安全处理前端传来的排序字段映射
        const sortMap = {
            'id': 'product_id',
            'sales': 'sales',
            'price': 'price',
            'created_time': 'create_time'
        };
        const actualSortField = sortMap[sort_field] || 'product_id';
        const actualSortOrder = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        sql += ` ORDER BY ${actualSortField} ${actualSortOrder} LIMIT ? OFFSET ?`;
        queryParams.push(Number(pageSize).toString(), offset.toString());

        const [rows] = await db.execute(sql, queryParams);

        // 🌟 重点修改 3：遍历 rows，从本地文件夹读取以 `1.` 开头的文件作为 image
        for (let row of rows) {
            const folderPath = `/upload/product/img/${row.id}/`;
            const absDirPath = path.join(process.cwd(), 'public', folderPath);

            // 如果文件夹存在，进去找 1.jpg / 1.png 等
            if (fs.existsSync(absDirPath)) {
                const files = fs.readdirSync(absDirPath);
                const mainFile = files.find(f => f.startsWith('1.'));
                if (mainFile) {
                    // 找到了物理文件，覆盖掉原来数据库查出来的 image 字段
                    row.image = folderPath + mainFile;
                }
            }
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

// 1. 获取商品详情与 SKU 规格字典
exports.getDetail = async (req, res) => {
    
    const productId = req.params.id;
    try {
        const [products] = await db.execute(
            `SELECT p.product_id as id, p.name, p.description, p.price, p.price as original_price, 
                    p.stock as stock_count, p.sales as sales_count, 
                    p.img, p.rate, 
                    c.name as category_name
             FROM product p 
             LEFT JOIN category c ON p.category_id = c.category_id
             WHERE p.product_id = ? AND p.product_status = '通过'`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: '商品不存在或已下架' });
        }
        let productInfo = products[0];

        // 1. 规定该商品的专属物理目录和网络相对路径
        const folderPath = `/upload/product/img/${productId}/`;
        const absDirPath = path.join(process.cwd(), 'public', folderPath);

        let main_image = '';
        let sub_images = [];

        // 2. 如果文件夹存在，读取里面的所有文件名
        if (fs.existsSync(absDirPath)) {
            const files = fs.readdirSync(absDirPath); // 例如: ['2.png', '1.jpg', '3.jpg']

            // 🌟 寻找主图：只要名字以 '1.' 开头的就是主图 (如 1.jpg, 1.png)
            const mainFile = files.find(f => f.startsWith('1.'));
            if (mainFile) {
                main_image = folderPath + mainFile;
            }

            // 🌟 寻找副图：循环找 2., 3., 4. 开头的文件
            for (let i = 2; i <= 4; i++) {
                const subFile = files.find(f => f.startsWith(`${i}.`));
                if (subFile) {
                    sub_images.push(folderPath + subFile);
                }
            }
        }
        // 3. 赋值给返回对象
        productInfo.main_image = main_image;
        productInfo.sub_images = sub_images;
        
        // 详情图默认把主图和副图全放进去（过滤掉空值）
        productInfo.detail_images = [main_image, ...sub_images].filter(Boolean);
        productInfo.rate = Number(productInfo.rate) || 5;

        // ==========================================
        // 往下是 SKU 的组装逻辑 (保持不变)
        // ==========================================
        const [skus] = await db.execute(
            `SELECT sku_id, name as spec_name, act_price, stock FROM sku_product WHERE product_id = ?`,
            [productId]
        );

        const spec_groups = {};
        const sku_list = {};

        skus.forEach(sku => {
            const specValues = sku.spec_name.split(/[\s\-]+/); 
            const skuKey = specValues.join('|');
            sku_list[skuKey] = {
                sku_id: sku.sku_id,
                price: Number(sku.act_price),
                original_price: Number(sku.act_price) + 200, 
                stock_count: Number(sku.stock)
            };

            specValues.forEach((val, index) => {
                const groupKey = `spec_${index}`; 
                if (!spec_groups[groupKey]) {
                    spec_groups[groupKey] = { name: index === 0 ? '款式' : '规格', options: [] };
                }
                const existOpt = spec_groups[groupKey].options.find(opt => opt.value === val);
                if (!existOpt) {
                    spec_groups[groupKey].options.push({ value: val, stock_count: sku.stock });
                } else {
                    existOpt.stock_count += sku.stock;
                }
            });
        });

        productInfo.spec_groups = spec_groups;
        productInfo.sku_list = sku_list;

        res.json({ status: 200, success: true, data: productInfo, message: '获取成功' });
    } catch (err) {
        console.error('获取详情错误：', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};

// 2. 获取商品评论
exports.getComments = async (req, res) => {
    const productId = req.params.id;
    try {
        const [comments] = await db.execute(
            `SELECT c.review_id as id, c.rating as score, c.comment as comment_text, 
                    DATE_FORMAT(c.create_time, '%Y-%m-%d %H:%i') as created_at,
                    u.username, u.img as user_avatar, c.parent_id
             FROM \`comment\` c
             JOIN user u ON c.user_id = u.user_id
             WHERE c.product_id = ? AND c.comment_status = '正常' AND c.parent_id IS NULL
             ORDER BY c.create_time DESC`,
            [productId]
        );

        // 获取商家的回复 (简单处理：遍历找出 parent_id 对应的回复)
        // 实际企业开发中会用更复杂的联表或分组查询
        for (let i = 0; i < comments.length; i++) {
            const [replies] = await db.execute(
                `SELECT comment FROM \`comment\` WHERE parent_id = ? LIMIT 1`, 
                [comments[i].id]
            );
            comments[i].images = []; // 模拟没图
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