const db = require('@/config/database');
const fs = require('fs');
const path = require('path');

// 1. 加入购物车
exports.addToCart = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { sku_id, quantity } = req.body;

    try {
        // 先查一下该用户购物车里是不是已经有这个 SKU 了
        const [exist] = await db.execute(
            `SELECT cart_id, quantity FROM cart WHERE user_id = ? AND sku_id = ?`,
            [user_id, sku_id]
        );

        if (exist.length > 0) {
            // 如果有了，数量累加
            await db.execute(
                `UPDATE cart SET quantity = quantity + ? WHERE cart_id = ?`,
                [quantity, exist[0].cart_id]
            );
        } else {
            // 如果没有，新增一条记录
            await db.execute(
                `INSERT INTO cart (user_id, sku_id, quantity) VALUES (?, ?, ?)`,
                [user_id, sku_id, quantity]
            );
        }
        
        // 🌟 统一规范响应
        res.json({ 
            success: true, 
            message: '成功加入购物车', 
            status: 200, 
            data: null 
        });
    } catch (err) {
        console.error('加入购物车异常:', err);
        // 🌟 统一规范错误响应
        res.status(500).json({ 
            success: false, 
            message: '加入购物车失败', 
            status: 500, 
            data: null 
        });
    }
};

// 2. 获取购物车列表
exports.getCartList = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    try {
        // 核心联表：把 cart, sku_product, product 三张表连起来查
        const [rows] = await db.execute(`
            SELECT c.cart_id as id, c.quantity as count, c.sku_id,
                   s.name as spec, s.act_price as price, s.stock,
                   p.name, p.product_status, p.product_id
            FROM cart c
            JOIN sku_product s ON c.sku_id = s.sku_id
            JOIN product p ON s.product_id = p.product_id
            WHERE c.user_id = ?
            ORDER BY c.create_time DESC
        `, [user_id]);

        // 动态读取主图
        rows.forEach(item => {
            const folderPath = `/upload/product/img/${item.product_id}/`;
            const absDirPath = path.join(process.cwd(), 'public', folderPath);
            item.main_image = '';
            if (fs.existsSync(absDirPath)) {
                const files = fs.readdirSync(absDirPath);
                const mainFile = files.find(f => f.startsWith('1.'));
                if (mainFile) item.main_image = folderPath + mainFile;
            }
            item.selected = false; 
        });

        // 🌟 统一规范响应
        res.json({ 
            success: true, 
            message: '获取购物车列表成功', 
            status: 200, 
            data: rows 
        });
    } catch (err) {
        console.error('获取购物车异常:', err);
        res.status(500).json({ 
            success: false, 
            message: '获取购物车失败', 
            status: 500, 
            data: null 
        });
    }
};

// 3. 更新购物车商品数量
exports.updateQuantity = async (req, res) => {
    const { cart_id, quantity } = req.body;
    try {
        await db.execute(`UPDATE cart SET quantity = ? WHERE cart_id = ?`, [quantity, cart_id]);
        
        // 🌟 统一规范响应
        res.json({ 
            success: true, 
            message: '商品数量更新成功', 
            status: 200, 
            data: null 
        });
    } catch (err) {
        console.error('更新购物车数量异常:', err);
        res.status(500).json({ 
            success: false, 
            message: '更新数量失败', 
            status: 500, 
            data: null 
        });
    }
};

// 4. 删除购物车商品 (支持批量删除)
exports.removeItems = async (req, res) => {
    const { cart_ids } = req.body; 
    try {
        if (!cart_ids || cart_ids.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: '删除失败，未提供商品参数', 
                status: 400, 
                data: null 
            });
        }
        
        const placeholders = cart_ids.map(() => '?').join(',');
        await db.execute(`DELETE FROM cart WHERE cart_id IN (${placeholders})`, cart_ids);
        
        // 🌟 统一规范响应
        res.json({ 
            success: true, 
            message: '商品删除成功', 
            status: 200, 
            data: null 
        });
    } catch (err) {
        console.error('删除购物车商品异常:', err);
        res.status(500).json({ 
            success: false, 
            message: '删除失败，服务器异常', 
            status: 500, 
            data: null 
        });
    }
};