const db = require('@/config/database');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
const fs = require('fs-extra');
const path = require('path');

// export interface productList {
//     product_id: number
//     name: string
//     price: number
//     stock: number
//     rate: number
//     auditStatus: string
//     seller_id: number
//     seller_name: string
//     category_id: number
//     category_name: string
//     desc: string
// }

exports.getAllProduct = [paginationMiddleware, async (req, res) => {
    try {
        console.log("管理员商品列表请求参数：", req.query);
        const { currentPage, pageSize, offset, formatResult } = req.pagination;
        const { name, auditStatus } = req.query; // 前端传auditStatus，对应product_status

        console.log("分页参数：", currentPage, pageSize, offset);

        //console.log("查询参数：", req.query);
        //console.log("分页参数：", req.pagination);

        // 1. 构建动态查询条件
        const whereConditions = [];
        const params = [];

        // 商品名称模糊查询
        if (name) {
            whereConditions.push("p.name LIKE ?");
            params.push(`%${name}%`);
        }

        // 商品状态查询（前端传auditStatus，对应product表product_status）
        if (auditStatus) {
            whereConditions.push("p.product_status = ?");
            params.push(auditStatus);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // 2. 核心SQL：关联shop表和category表，映射所有TS接口字段
        const listSql = `
        SELECT 
          p.product_id,
          p.name,
          p.price,
          p.stock,
          p.rate,
          p.product_status AS auditStatus,
          p.shop_id AS seller_id,
          s.name AS seller_name,
          p.category_id,
          c.name AS category_name,
          p.description 
        FROM product p
        LEFT JOIN shop s ON p.shop_id = s.shop_id
        LEFT JOIN category c ON p.category_id = c.category_id
        ${whereClause}
        LIMIT ?, ?
      `;
        // 追加分页参数
        params.push(offset, pageSize);


        // 3. 执行查询，获取商品列表
        const [productList] = await db.query(listSql, params);

        // 3.5 扫描每个商品的图片目录，生成 allImg 数组
        for (let item of productList) {
            const folderPath = `/upload/product/img/${item.product_id}/`;
            const absDirPath = path.join(process.cwd(), 'public', folderPath);
            const allImg = [];

            if (fs.existsSync(absDirPath)) {
                const files = fs.readdirSync(absDirPath);
                const imageFiles = files
                    .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
                    .sort((a, b) => {
                        const numA = parseInt(path.parse(a).name);
                        const numB = parseInt(path.parse(b).name);
                        return (isNaN(numA) ? Infinity : numA) - (isNaN(numB) ? Infinity : numB);
                    });

                for (const file of imageFiles) {
                    allImg.push(`/upload/product/img/${item.product_id}/${file}`);
                }
            }

            item.allImg = allImg;
            item.img = allImg.length > 0 ? `/upload/product/img/${item.product_id}` : '';
        }

        // 4. 查询总条数（用于分页）
        const countSql = `
        SELECT COUNT(*) AS total 
        FROM product p
        LEFT JOIN shop s ON p.shop_id = s.shop_id
        LEFT JOIN category c ON p.category_id = c.category_id
        ${whereClause}
      `;
        const [countResult] = await db.query(countSql, params.slice(0, -2)); // 移除分页参数
        const total = countResult[0].total || 0;

        // 5. 构建分页对象
        const pagination = {
            currentPage,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        };
        console.log("商品列表分页信息:", pagination)

        // 6. 严格按照指定格式返回
        return res.json({
            success: true,
            message: "获取商品列表成功",
            status: 200,
            data: {
                productList,
                pagination
            }
        });

    } catch (err) {
        console.error("商品列表查询错误：", err);
        return res.json({
            success: false,
            message: "获取商品列表失败",
            status: 500,
            data: {}
        });
    }

}]

exports.updateProductStatus = async (req, res) => {
    if (!req.body.product_id || !req.body.operation) {
        return res.json({
            status: 400,
            success: false,
            message: '操作类型不能为空',
            data: false
        });
    }
    const { product_id, operation } = req.body;
    console.log(product_id, operation)
    const operationMap = {
        pass: { field: 'product_status', value: '通过' },   // 驳回退款
        reject: { field: 'product_status', value: '已驳回' },   // 运行退款
        delete: { field: 'product_status', value: '已驳回' },   // 删除商品
    };
    try {
        console.log("更新商品状态请求参数：", req.body);
        const { product_id, product_status } = req.body;
        let updateSql = `
        UPDATE product
        SET ${operationMap[operation].field} = ?
        WHERE 1=1
          `;
        if (product_id.length === 0) {
            updateSql += ` AND product_status = '待审核'`;
            await db.query(updateSql, [operationMap[operation].value]);
        }
        else {
            updateSql += ` AND product_id IN (${product_id.map(() => '?').join(',')})`;
            await db.query(updateSql, [operationMap[operation].value, ...product_id]);
        }

        return res.json({
            success: true,
            message: "商品状态更新成功",
            status: 200,
            data: {}
        });
    } catch (err) {
        console.error("更新商品状态错误：", err);
        return res.json({
            success: false,
            message: "更新商品状态失败",
            status: 500,
            data: {}
        });
    }
}