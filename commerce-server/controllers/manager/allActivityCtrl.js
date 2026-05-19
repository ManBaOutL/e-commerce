const db = require('@/config/database');
const path = require('path');
const fs = require('fs');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
const formatIsoDate = require('@/utils/date').formatIsoDate;

exports.getAllActivity = [paginationMiddleware, async (req, res) => {
    const { name, category_name, type, status } = req.query;
    const { currentPage, pageSize, offset, formatResult } = req.pagination;

    console.log("筛选条件:", req.query)
    console.log("当前页:", currentPage, "每页数量:", pageSize)

    try {
        const conditions = [];
        const params = [];

        if (name) {
            conditions.push('a.name LIKE ?');
            params.push(`%${name}%`);
        }
        if (category_name) {
            if (category_name === '所有商品' || category_name === '所有') {
                conditions.push('a.goods_type_id = 0');
            } else {
                conditions.push('c.name = ?');
                params.push(category_name);
            }
        }
        if (status) {
            conditions.push('a.act_status = ?');
            params.push(status);
        }
        if (type) {
            conditions.push('a.act_type = ?');
            params.push(type);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // 统计总数
        const [countResult] = await db.query(`
            SELECT COUNT(*) AS total FROM activity a
            LEFT JOIN category c ON a.goods_type_id = c.category_id
            ${where}
        `, params);
        const total = countResult[0].total;

        // 查询列表
        const [rows] = await db.query(`
            SELECT 
                a.act_id AS actId,
                a.name AS actName,
                a.act_status AS status,
                a.act_type AS actType,
                a.start_time AS startTime,
                a.end_time AS endTime,
                a.goods_type_id AS categoryID,
                c.name AS categoryName,
                a.max_discount_value AS discountRate,
                a.min_amount AS minOrderAmount,
                a.rule AS rule,
                a.img AS img
            FROM activity a
            LEFT JOIN category c ON a.goods_type_id = c.category_id
            ${where}
            ORDER BY a.start_time DESC
            LIMIT ? OFFSET ?
        `, [...params, pageSize, offset]);

        // 处理数据：goods_type_id=0 → 显示所有商品
        const actList = rows.map(a => ({
            actId: a.actId,
            actName: a.actName,
            categoryID: a.categoryID,
            categoryName: a.categoryName || '所有商品',
            discountRate: a.discountRate,
            minOrderAmount: a.minOrderAmount,
            status: Date.now() < new Date(a.startTime) ? '未开始' : (Date.now() > new Date(a.endTime) ? '已结束' : '进行中'),
            actType: a.actType,
            startTime: formatIsoDate(a.startTime),
            endTime: formatIsoDate(a.endTime),
            rule: a.rule,
            img: a.img,
        }));

        return res.json({
            status: 200,
            success: true,
            message: '获取活动成功',
            data: {
                actList,
                pagination: formatResult(total)
            }
        });

    } catch (err) {
        console.error("活动列表错误：", err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: '服务器错误',
            data: {
                actList: [],
                pagination: { currentPage, pageSize, total: 0, totalPages: 0 }
            }
        });
    }
}];

exports.updateActivityStatus = async (req, res) => {
    const { activity_id, newActivity, operation } = req.body;
    console.log("更新活动状态传如参数:", activity_id, newActivity, operation)
    if (!operation) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: '操作类型不能为空',
            data: {}
        });
    }
    if (operation === 'create') {
        const { actName, actType, categoryID, rule, discountRate, minOrderAmount, startTime, endTime, status, img } = newActivity;
        if (!actName || !actType || categoryID === undefined || categoryID === null || !rule || discountRate === undefined || minOrderAmount === undefined || !startTime || !endTime || !status) {
            return res.status(400).json({ status: 400, success: false, message: '新活动信息不能为空', data: {} });
        }
        
        // 时间顺序验证
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ status: 400, success: false, message: '开始时间必须早于结束时间', data: {} });
        }
        
        // 折扣值范围验证
        if (Number(discountRate) <= 0 || Number(discountRate) > 100) {
            return res.status(400).json({ status: 400, success: false, message: '折扣率必须在0-100之间', data: {} });
        }

        // 🌟 2. 处理图片“转正”逻辑 (从 temp 移动到 activities 目录)
        let finalImgPath = img;
        if (img && img.includes('/upload/temp/')) {
            const fileName = path.basename(img);
            const tempAbsPath = path.join(process.cwd(), 'public', 'upload', 'temp', fileName);
            const targetDir = path.join(process.cwd(), 'public', 'upload', 'activities');
            const targetAbsPath = path.join(targetDir, fileName);

            // 如果 activities 目录不存在，则创建
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // 移动文件并更新入库路径
            if (fs.existsSync(tempAbsPath)) {
                fs.renameSync(tempAbsPath, targetAbsPath);
                finalImgPath = `/upload/activities/${fileName}`;
            }
        }
        // 🌟 3. 修复了原来最后一个参数写死为 null 的 Bug，换成了 finalImgPath
        await db.query(`
            INSERT INTO activity (name, act_type, goods_type_id, rule, max_discount_value, min_amount, start_time, end_time, act_status, img)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [actName, actType, categoryID, rule, discountRate, minOrderAmount, startTime, endTime, status, finalImgPath]);

        return res.json({ status: 200, success: true, message: '活动创建成功', data: true });

    } else if (operation === 'delete') {
        // 删除活动
        if (!activity_id || !Array.isArray(activity_id) || activity_id.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: '活动ID不能为空',
                data: {}
            });
        }
        // 使用参数化查询，防止 SQL 注入
        const placeholders = activity_id.map(() => '?').join(',');
        await db.query(`
            DELETE FROM activity WHERE act_id IN (${placeholders})
        `, activity_id);
        return res.json({
            status: 200,
            success: true,
            message: '活动删除成功',
            data: true
        });
    }

}