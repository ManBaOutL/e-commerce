const db = require('@/config/database');

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

        // 🌟 重点 1：使用 AS 起别名，直接适配前端 ProductCard 的 id 和 image 属性
        let sql = `SELECT product_id AS id, name, price, img AS image, sales, stock 
                   FROM product 
                   WHERE product_status = '通过'`;

        // 动态拼接条件
        if (category_id) {
            // 考虑一级分类和二级分类：如果传的是一级分类，要查出下面所有二级分类的商品
            sql += ` AND (category_id = ? OR category_id IN (SELECT category_id FROM category WHERE parent_id = ?))`;
            queryParams.push(category_id, category_id);
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
        // 在 getList 逻辑中加入：
        if (start_time && end_time) {
            sql += ` AND create_time BETWEEN ? AND ?`;
            // 给日期加上具体时分秒，确保覆盖全天
            queryParams.push(`${start_time} 00:00:00`, `${end_time} 23:59:59`);
        }

        // 查总数 (分页用)
        const countSql = sql.replace('product_id AS id, name, price, img AS image, sales, stock', 'COUNT(*) as total');
        const [[{ total }]] = await db.execute(countSql, queryParams);

        // 🌟 重点 2：安全处理前端传来的排序字段映射
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

// 获取商品详情 (包含规格)
exports.getDetail = async (req, res) => {
    const productId = req.params.id;
    try {
        // 1. 查商品基础信息
        const [products] = await db.execute(
            `SELECT p.*, s.name as shop_name FROM product p 
             LEFT JOIN shop s ON p.shop_id = s.shop_id 
             WHERE p.product_id = ? AND p.product_status = '通过'`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: '商品不存在或已下架' });
        }

        const productInfo = products[0];

        // 2. 查商品规格 (关联 specification 表)
        const [specs] = await db.execute(
            `SELECT ps.spec_id, ps.scale, ps.stock, s.name as spec_name 
             FROM product_spec ps 
             JOIN specification s ON ps.spec_id = s.spec_id 
             WHERE ps.product_id = ?`,
            [productId]
        );

        productInfo.specs = specs;
        res.json({ status: 200, success: true, data: productInfo, message: '获取成功' });
    } catch (err) {
        console.error('获取商品详情错误：', err.message);
        res.status(500).json({ status: 500, success: false, message: '服务器内部错误' });
    }
};