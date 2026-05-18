const fs = require('fs-extra');
const path = require('path');
const db = require('@/config/database');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
// export interface productList {
//     product_id: number,
//     name: string,
//     price: number,
//     stock: number,// 库存数量，可能要用到触发器更新库存
//     desc: string,
//     img?: string,
//     specs: [
//         {
//             name: string,
//             price: number,
//             stock: number
//         }
//     ]
// }

// export interface productCondition {
//     categoryName?: number,
//     name?: string,
//     stock?: number
// }

exports.getAllProduct = [paginationMiddleware, async (req, res) => {
    try {
        console.log("管理员商品列表请求参数：", req.query);
        const { user_id } = req.user;
        const { currentPage, pageSize, offset, formatResult } = req.pagination;
        const { categoryName, name, auditStatus, stock } = req.query; // 前端传auditStatus，对应product_status字段

        console.log("分页参数：", currentPage, pageSize, offset);

        //console.log("查询参数：", req.query);
        //console.log("分页参数：", req.pagination);

        // 1. 构建动态查询条件
        const whereConditions = [];
        const params = [];

        whereConditions.push("s.user_id = ?");
        params.push(user_id);

        // 商品名称模糊查询
        if (name) {
            whereConditions.push("p.name LIKE ?");
            params.push(`%${name}%`);
        }

        // 商品状态查询（前端传auditStatus，对应product表product_status）
        // if (auditStatus) {
        //     whereConditions.push("p.product_status = ?");
        //     params.push(auditStatus);
        // }

        // 商品分类查询（前端传categoryName，对应category表name）
        if (categoryName) {
            whereConditions.push("c.name LIKE ?");
            params.push(`%${categoryName}%`);
        }

        // 商品库存查询（前端传stock，对应product表stock）
        if (stock !== undefined) {
            whereConditions.push("p.stock <= ?");
            params.push(stock);
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
                p.img,
                p.description AS \`desc\`,
                c.name AS categoryName
                FROM product p
                LEFT JOIN shop s ON p.shop_id = s.shop_id
                LEFT JOIN category c ON p.category_id = c.category_id
                ${whereClause}
                LIMIT ?, ?
            `;
        // 追加分页参数
        params.push(offset, pageSize);
        console.log("查询SQL：", listSql);


        // 3. 执行查询，获取商品列表
        const [productList] = await db.query(listSql, params);

        // 循环给每个商品查 specs
        for (let item of productList) {
            const [specs] = await db.query(
                `SELECT name, act_price AS price, stock FROM sku_product WHERE product_id = ?`,
                [item.product_id]
            );
            item.specs = specs;
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


        const [catRows] = await db.query(`
        SELECT DISTINCT c.name
        FROM product p
        JOIN shop s ON p.shop_id = s.shop_id
        JOIN category c ON p.category_id = c.category_id
        WHERE s.user_id = ?
        `, [user_id]);

        const categoryList = catRows.map(v => v.name);

        // 6. 严格按照指定格式返回
        return res.json({
            success: true,
            message: "获取商品列表成功",
            status: 200,
            data: {
                productList,
                pagination,
                categoryList
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
    if (!req.body.operation) {
        return res.json({
            status: 400,
            success: false,
            message: '操作类型不能为空',
            data: false
        });
    }
    const user_id = req.user.user_id;
    const { product_id, operation, img, specs } = req.body;
    const { name, price, stock, rate, desc, status } = req.body;

    console.log("更新商品状态请求:", req.body);

    console.log("更新商品图片:", img)

    try {

        // ==========================
        // 新增商品
        // ==========================
        if (operation === 'add') {
            const { name, categoryName, price, stock, rate, desc, status } = req.body;

            // ==========================================
            // 🛡️ 表单验证
            // ==========================================
            if (!name || name.trim().length < 2 || name.trim().length > 100) {
                return res.json({ status: 400, success: false, message: '商品名称必须在2-100字符之间' });
            }

            if (!price || isNaN(price) || Number(price) <= 0 || Number(price) > 9999999.99) {
                return res.json({ status: 400, success: false, message: '商品价格必须在0-9999999.99之间' });
            }

            if (!stock || isNaN(stock) || Number(stock) < 0 || Number(stock) > 999999) {
                return res.json({ status: 400, success: false, message: '库存数量必须在0-999999之间' });
            }

            // 获取分类
            const [cates] = await db.query(`SELECT category_id FROM category WHERE name = ? LIMIT 1`, [categoryName]);
            if (!cates.length) return res.json({ status: 400, success: false, message: '分类不存在' });
            const category_id = cates[0].category_id;

            // 获取店铺
            const [shops] = await db.query(`SELECT shop_id FROM shop WHERE user_id = ? LIMIT 1`, [user_id]);
            if (!shops.length) return res.json({ status: 400, success: false, message: '未找到店铺' });
            const shop_id = shops[0].shop_id;

            const conn = await db.getConnection();
            await conn.beginTransaction();

            try {
                // 插入商品
                const [prodRet] = await conn.query(
                    `INSERT INTO product (name, description, price, stock, category_id, shop_id, product_status, img, rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [name, desc, price, stock, category_id, shop_id, status || '待审核', '', rate || 0]
                );
                const newId = prodRet.insertId;

                // 插入规格
                const skuData = specs.map(s => [s.name, s.price, s.stock, newId]);
                if (skuData.length !== 0) {
                    await conn.query(`INSERT INTO sku_product (name, act_price, stock, product_id) VALUES ?`, [skuData]);
                    console.log("已产生商品编号", newId);
                }


                // ==========================
                // 图片处理（完全正确版）
                // ==========================
                let finalImgStr = '';
                if (img && img.trim() !== '') {
                    const imgArr = img.split(',').map(i => i.trim()).filter(Boolean);

                    const targetDir = path.join(__dirname, '../../public/upload/product/img/', newId.toString());
                    await fs.mkdir(targetDir, { recursive: true });

                    let existingFiles = [];
                    if (await fs.exists(targetDir)) {
                        existingFiles = await fs.readdir(targetDir);
                    }

                    const numbers = existingFiles
                        .map(file => parseInt(path.parse(file).name))
                        .filter(num => !isNaN(num));

                    let nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

                    const newPaths = [];
                    for (let i = 0; i < imgArr.length; i++) {
                        const tempPath = imgArr[i];
                        const ext = path.extname(tempPath);
                        const newFileName = `${nextNumber + i}${ext}`;

                        const sourcePath = path.join(__dirname, '../../public', tempPath);
                        const targetPath = path.join(targetDir, newFileName);

                        if (await fs.exists(sourcePath)) {
                            await fs.rename(sourcePath, targetPath);
                            newPaths.push(`/upload/product/img/${newId}/${newFileName}`);
                        }
                    }

                    finalImgStr = `/upload/product/img/${newId}`;
                }

                // 更新商品图片字段
                await conn.query(`UPDATE product SET img = ? WHERE product_id = ?`, [finalImgStr, newId]);

                await conn.commit();
                conn.release();
                return res.json({ status: 200, success: true, message: '新增成功', data: newId });

            } catch (err) {
                await conn.rollback();
                conn.release();
                console.error(err);
                return res.json({ status: 500, success: false, message: '新增失败' });
            }
        }
        // ==========================
        // 编辑商品（不修改分类）
        // ==========================
        else if (operation === 'edit') {


            const [shops] = await db.query(`SELECT shop_id FROM shop WHERE user_id = ? LIMIT 1`, [user_id]);
            if (!shops.length) return res.json({ status: 400, success: false, message: '无店铺' });
            const shop_id = shops[0].shop_id;

            const conn = await db.getConnection();
            await conn.beginTransaction();

            try {
                // ==========================
                // 🛡️ 图片处理（修复空图片清空问题）
                // ==========================
                let finalImgStr = null; // 初始为 null，表示不更新图片
                if (img && img.trim() !== '') {
                    finalImgStr = ''; // 有新图片时，先清空旧图片设置

                    const imgArr = img.split(',').map(i => i.trim()).filter(Boolean);

                    const targetDir = path.join(__dirname, '../../public/upload/product/img/', product_id.toString());
                    await fs.mkdir(targetDir, { recursive: true });

                    let existingFiles = [];
                    if (await fs.exists(targetDir)) {
                        existingFiles = await fs.readdir(targetDir);
                    }

                    const numbers = existingFiles
                        .map(file => parseInt(path.parse(file).name))
                        .filter(num => !isNaN(num));

                    let nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

                    const newPaths = [];
                    for (let i = 0; i < imgArr.length; i++) {
                        const tempPath = imgArr[i];
                        const ext = path.extname(tempPath);
                        const newFileName = `${nextNumber + i}${ext}`;

                        const sourcePath = path.join(__dirname, '../../public', tempPath);
                        const targetPath = path.join(targetDir, newFileName);

                        if (await fs.exists(sourcePath)) {
                            await fs.rename(sourcePath, targetPath);
                            newPaths.push(`/upload/product/img/${product_id}/${newFileName}`);
                        }
                    }
                    console.log(newPaths);
                    finalImgStr = `/upload/product/img/${product_id}`;
                }
                console.log(finalImgStr);

                // 🛡️ 更新商品（只有传了新图片才更新图片字段）
                if (finalImgStr !== null) {
                    await conn.query(
                        `UPDATE product
                        SET name=?, description=?, price=?, stock=?, shop_id=?, product_status=?, img=?, rate=?, update_time=NOW()
                        WHERE product_id=?`,
                        [name, desc, price, stock, shop_id, status || '待审核', finalImgStr, rate || 0, product_id]
                    );
                } else {
                    await conn.query(
                        `UPDATE product
                        SET name=?, description=?, price=?, stock=?, shop_id=?, product_status=?, rate=?, update_time=NOW()
                        WHERE product_id=?`,
                        [name, desc, price, stock, shop_id, status || '待审核', rate || 0, product_id]
                    );
                }

                // 更新规格
                await conn.query(`DELETE FROM sku_product WHERE product_id = ?`, [product_id]);
                const skuData = specs.map(s => [s.name, s.price, s.stock, product_id]);
                await conn.query(`INSERT INTO sku_product (name, act_price, stock, product_id) VALUES ?`, [skuData]);

                await conn.commit();
                conn.release();
                return res.json({ status: 200, success: true, message: '编辑成功' });

            } catch (err) {
                await conn.rollback();
                conn.release();
                console.error(err);
                return res.json({ status: 500, success: false, message: '编辑失败' });
            }
        }
        else if (operation === 'delete') {
            const conn = await db.getConnection();
            await conn.beginTransaction();
            try {
                await conn.query(`UPDATE product SET product_status='下架' WHERE product_id = ?`, [product_id]);
                await conn.commit();
                conn.release();
                return res.json({ status: 200, success: true, message: '下架成功' });
            } catch (err) {
                await conn.rollback();
                conn.release();
                console.error(err);
                return res.json({ status: 500, success: false, message: '下架失败' });
            }
        } else if (operation === 'pass') {
            const conn = await db.getConnection();
            await conn.beginTransaction();
            try {
                await conn.query(`UPDATE product SET product_status='通过' WHERE product_id = ?`, [product_id]);
                await conn.commit();
                conn.release();
                return res.json({ status: 200, success: true, message: '上架成功' });
            } catch (err) {
                await conn.rollback();
                conn.release();
                console.error(err);
                return res.json({ status: 500, success: false, message: '上架失败' });
            }
        }
        else if (operation === 'stock') {
            // 先判断 ID 存在
            if (!product_id) {
                return res.json({ status: 400, success: false, message: '商品ID不存在' });
            }

            const conn = await db.getConnection();
            await conn.beginTransaction();

            try {
                // 1. 更新商品总库存
                await conn.query(
                    `UPDATE product SET stock=? WHERE product_id=?`,
                    [stock, product_id]
                );

                // 2. 删除旧规格
                await conn.query(
                    `DELETE FROM sku_product WHERE product_id=?`,
                    [product_id]
                );

                // 3. 如果有规格才插入（防止空规格）
                if (specs && specs.length > 0) {
                    const skuData = specs.map(s => [
                        s.name,
                        s.price,
                        s.stock,
                        product_id
                    ]);

                    await conn.query(
                        `INSERT INTO sku_product (name, act_price, stock, product_id) VALUES ?`,
                        [skuData]
                    );
                }

                await conn.commit();
                conn.release();
                return res.json({ status: 200, success: true, message: '补货成功' });

            } catch (err) {
                await conn.rollback();
                conn.release();
                console.error(err);
                return res.json({ status: 500, success: false, message: '补货失败' });
            }
        }

    } catch (err) {
        console.error(err);
        return res.json({ status: 500, success: false, message: '服务器错误' });
    }
};