const db = require('@/config/database');

// 根据时间自动更新活动状态
const updateActivityStatus = async () => {
    try {
        // 1. 更新未开始的活动：当前时间 >= 开始时间 且 状态为"未开始" -> 改为"进行中"
        await db.execute(`
            UPDATE activity 
            SET act_status = '进行中' 
            WHERE act_status = '未开始' 
              AND start_time <= NOW()
        `);

        // 2. 更新进行中的活动：当前时间 > 结束时间 且 状态为"进行中" -> 改为"已结束"
        await db.execute(`
            UPDATE activity 
            SET act_status = '已结束' 
            WHERE act_status = '进行中' 
              AND end_time < NOW()
        `);

        console.log('[活动状态更新] 已根据时间自动更新活动状态');
    } catch (err) {
        console.error('[活动状态更新] 更新失败:', err.message);
    }
};

// 获取首页展示的进行中活动
exports.getPublicActivities = async (req, res) => {
    try {
        // 先根据时间自动更新活动状态
        await updateActivityStatus();

        // 然后查询进行中的活动
        const [rows] = await db.query(`
            SELECT act_id, name, img, act_type, start_time, end_time, act_status
            FROM activity 
            WHERE act_status = '进行中' 
              AND img IS NOT NULL
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

// 获取活动详情
exports.getActivityDetail = async (req, res) => {
    const { act_id } = req.params;
    try {
        // 先根据时间自动更新活动状态
        await updateActivityStatus();

        const [rows] = await db.query(`
            SELECT * FROM activity 
            WHERE act_id = ?
        `, [act_id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '活动不存在', data: null });
        }

        const activity = rows[0];

        res.json({
            status: 200,
            success: true,
            message: '获取活动详情成功',
            data: activity
        });
    } catch (err) {
        console.error("获取活动详情失败：", err);
        res.status(500).json({ success: false, message: '服务器错误', data: null });
    }
};

// 获取所有活动
exports.getAllActivities = async (req, res) => {
    try {
        // 先根据时间自动更新活动状态
        await updateActivityStatus();

        const [rows] = await db.query(`
            SELECT * FROM activity 
            ORDER BY start_time DESC
        `);

        res.json({
            status: 200,
            success: true,
            message: '获取所有活动成功',
            data: rows
        });
    } catch (err) {
        console.error("获取所有活动失败：", err);
        res.status(500).json({ success: false, message: '服务器错误', data: [] });
    }
};