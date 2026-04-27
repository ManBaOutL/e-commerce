const db = require('@/config/database');

// 获取首页展示的进行中活动
exports.getPublicActivities = async (req, res) => {
    try {
        // 只查询状态为“进行中”且有图片的活动，最多取 5 条，按时间倒序
        const [rows] = await db.query(`
            SELECT act_id, name, img, act_type 
            FROM activity 
            WHERE act_status = '进行中' AND img IS NOT NULL
            ORDER BY start_time DESC 
            LIMIT 5
        `);

        res.json({
            status: 200,
            success: true,
            message: '获取首页活动成功',
            data: rows
        });
    } catch (err) {
        console.error("获取首页活动失败：", err);
        res.status(500).json({ success: false, message: '服务器错误', data: [] });
    }
};