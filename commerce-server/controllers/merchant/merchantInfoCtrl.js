const db = require('@/config/database')

exports.getMerchantInfo = async (req, res) => {
    try {
        const merchantId = req.user.merchantId;

        // 查询店铺信息
        const [info] = await db.query(`
            SELECT 
                name as shopName,
                description
            FROM merchant_info 
            WHERE merchant_id = ?
        `, [merchantId]);

        // 查询商家信息
        const [merchant] = await db.query(`
            SELECT 
                id,
                name as nickname,
                phone,
                email
            FROM merchant 
            WHERE id = ?
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
            hasShop: hasShop,
            shopInfo: hasShop ? {
                shopName: shopInfo.shopName,
                description: shopInfo.description,
                phone: merchants.phone
            } : null
        };

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
        const merchantId = req.user.merchantId;
        const { name, description, phone } = req.body.shopInfo;
        const operation = req.body.operation || 'create';
    }
}
