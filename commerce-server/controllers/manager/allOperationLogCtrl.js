const db = require('@/config/database');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
const formatIsoDate = require('@/utils/date').formatIsoDate;


exports.getAllOperationLog = [paginationMiddleware, async (req, res) => {
    const { username, content, type } = req.query;
    const { currentPage, pageSize, offset, formatResult } = req.pagination;

    console.log("筛选条件:", req.query)
    console.log("当前页:", currentPage, "每页数量:", pageSize)

    try {
        const conditions = [];
        const params = [];

        if (username) {
            conditions.push('username LIKE ?');
            params.push(`%${username}%`);
        }
        if (content) {
            conditions.push('content LIKE ?');
            params.push(`%${content}%`);
        }
        if (type) {
            conditions.push('log_type = ?');
            params.push(type);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // 统计总数
        const [countResult] = await db.query(`
            SELECT COUNT(*) AS total FROM log
            ${where}
        `, params);
        const total = countResult[0].total;

        // 查询列表
        const [rows] = await db.query(`
            SELECT 
                log_id AS logId,
                username,
                role,
                content,
                log_type AS type,
                create_time AS time,
                result
            FROM log
            ${where}
            ORDER BY create_time DESC
            LIMIT ? OFFSET ?
        `, [...params, pageSize, offset]);


        // 查询所有操作类型
        const [typeRows] = await db.query(`
            SELECT DISTINCT log_type AS type FROM log
        `);
        const allType = typeRows.map(item => item.type);

        // 处理数据：goods_type_id=0 → 显示所有商品
        const log = rows.map(item => ({
            logId: item.logId,
            username: item.username,
            role: item.role,
            content: item.content,
            type: item.type,
            time: formatIsoDate(item.time, false),
            result: item.result,
        }));

        return res.json({
            status: 200,
            success: true,
            message: '获取操作日志成功',
            data: {
                log,
                allType: allType,
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