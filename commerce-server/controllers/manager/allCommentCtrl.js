const db = require('@/config/database');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
const formatIsoDate = require('@/utils/date').formatIsoDate;

exports.getAllComment = [paginationMiddleware, async (req, res) => {
    const { username, goodsName, status } = req.query;
    const { currentPage, pageSize, offset, formatResult } = req.pagination;

    console.log("筛选条件:", req.query)
    console.log("当前页:", currentPage, "每页数量:", pageSize)

    try {
        const conditions = [];
        const params = [];

        if (username) {
            conditions.push('us.username LIKE ?');
            params.push(`%${username}%`);
        }
        if (goodsName) {
            conditions.push('p.name LIKE ?');
            params.push(`%${goodsName}%`);
        }
        if (status) {
            conditions.push('c.comment_status = ?');
            params.push(status);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        console.log(where)

        // 统计总数
        const [countResult] = await db.query(`
            SELECT COUNT(*) AS total FROM comments c
            LEFT JOIN product p ON p.product_id = c.product_id
            LEFT JOIN user us ON us.user_id = c.user_id
            ${where}
        `, params);
        const total = countResult[0].total;

        // 查询列表
        const [rows] = await db.query(`
            SELECT 
                c.review_id AS comment_id,
                p.name AS goodsName,
                c.comment_status AS status,
                us.username AS username,
                c.comment AS content,
                c.rating AS score,
                c.create_time AS createTime,
                c.update_time AS updateTime
            FROM comments c
            LEFT JOIN product p ON p.product_id = c.product_id
            LEFT JOIN user us ON us.user_id = c.user_id
            ${where}
            ORDER BY c.create_time DESC
            LIMIT ? OFFSET ?
        `, [...params, pageSize, offset]);


        // 处理数据：goods_type_id=0 → 显示所有商品
        const commentList = rows.map(item => ({
            comment_id: item.comment_id,
            goodsName: item.goodsName,
            username: item.username,
            content: item.content,
            score: item.score,
            createTime: formatIsoDate(item.createTime, false),
            updateTime: formatIsoDate(item.updateTime, false),
            status: item.status,
        }));

        return res.json({
            status: 200,
            success: true,
            message: '获取评论列表成功',
            data: {
                commentList,
                pagination: formatResult(total)
            }
        });

    } catch (err) {
        console.error("评论表查询错误：", err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: '服务器错误',
            data: {
                commentList: [],
                pagination: { currentPage, pageSize, total: 0, totalPages: 0 }
            }
        });
    }
}];

exports.updateCommentStatus = async (req, res) => {
    const { comment_id, operation } = req.body;
    console.log("更新评论状态:", comment_id, operation)

    const operationMap = {
        enable: { field: 'comment_status', value: '正常' },
        disable: { field: 'comment_status', value: '屏蔽' },
        delete: { field: 'comment_status', value: '已删除' },   // 删除已屏蔽的评论
    };
    try {
        if (!operationMap[operation]) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: '无效的操作类型',
                data: {
                    comment_id,
                    operation
                }
            });
        }
        const { field, value } = operationMap[operation];
        if (operation === 'delete') {
            // 删除已屏蔽的评论
            await db.query(`
                DELETE FROM comments
                WHERE comment_status='屏蔽'`)
        } else {
            await db.query(`
                UPDATE comments
                SET comment_status = ?
                WHERE review_id IN (${comment_id.map(() => '?').join(',')})
            `, [value, ...comment_id]);
        }
        return res.json({
            status: 200,
            success: true,
            message: '评论状态更新成功',
            data: true
        });
    } catch (err) {
        console.error("评论状态更新错误：", err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: '服务器错误',
            data: {
                comment_id,
                status
            }
        });
    }
}
