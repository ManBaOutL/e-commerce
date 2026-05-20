const db = require('@/config/database')

exports.getMerchantInfo = async (req, res) => {
    console.log("获取商家信息请求");
    try {
        const merchantId = req.user.user_id;
        console.log("req.user:", req.user);
        console.log("merchantId:", merchantId);

        // 查询店铺信息
        const [info] = await db.query(`
            SELECT 
                name as shopName,
                description
            FROM shop 
            WHERE user_id = ?
        `, [merchantId]);

        // 查询商家信息
        const [merchant] = await db.query(`
            SELECT 
                user_id as id,
                username as nickname,
                phone,
                email,
                balance
            FROM user
            WHERE user_id = ?
        `, [merchantId]);

        const merchants = merchant[0];
        const hasShop = info.length > 0;
        const shopInfo = info[0];

        // 组装返回数据（完全匹配你的 interface）
        const merchantInfo = {
            ...merchants,
            id: merchants.id,
            nickname: merchants.nickname,
            phone: merchants.phone,
            email: merchants.email,
            balance: Number(merchants.balance || 0), // 添加余额字段
            hasShop: hasShop,
            shopInfo: hasShop ? {
                shopName: shopInfo.shopName,
                description: shopInfo.description,
                phone: merchants.phone
            } : null
        };
        console.log("merchantInfo:", merchantInfo);

        res.json({
            status: 200,
            success: true,
            message: "获取商家信息成功",
            data: merchantInfo
        });

    } catch (err) {
        console.error("获取商家信息错误：", err);
        res.json({
            status: 500,
            success: false,
            message: "服务器错误",
            data: null
        });
    }
};


// export interface merchantInfo {
//     id: number,
//     nickname: string,
//     phone?: string,
//     email?: string,
//     hasShop: boolean,
//     shopInfo?: {
//         shopName: string,
//         description: string,
//         phone: string
//     }
// }

exports.createShop = async (req, res) => {
    try {
        const merchantId = req.user.user_id;
        console.log("创建店铺req.body:", req.body);
        const { shopName, description, phone } = req.body.shopInfo;
        const operation = req.body.operation || 'create';

        // 1. 必传参数校验
        if (!shopName || !phone) {
            return res.status(400).json({
                success: false,
                message: '店铺名称和联系电话不能为空'
            });
        }

        // 2. 开启事务（保证两张表同时成功/失败）
        await db.query('START TRANSACTION');

        // 3. 更新 user 表的 phone
        await db.query(
            'UPDATE user SET phone = ? WHERE user_id = ?',
            [phone, merchantId]
        );
        //console.log("更新商家联系电话成功");

        // 4. 创建 or 更新店铺信息
        if (operation === 'create') {
            // 创建店铺
            await db.query(
                'INSERT INTO shop (user_id, name, description) VALUES (?, ?, ?)',
                [merchantId, shopName, description || '无描述']
            );
            //console.log("创建店铺成功");
        }

        // 5. 提交事务
        await db.query('COMMIT');
        console.log("创建/更新店铺成功");

        return res.json({
            success: true,
            message: operation === 'create' ? '创建店铺成功' : '更新店铺成功',
            data: null,
            status: 200
        });

    } catch (err) {
        // 回滚事务
        await db.query('ROLLBACK');
        console.error('创建/更新店铺错误：', err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: '服务器错误',
            data: null
        });
    }
};
