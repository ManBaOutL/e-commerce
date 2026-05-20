const db = require('@/config/database');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
const dateUtils = require('@/utils/date.js');
const dayjs = require('dayjs'); // 引入日期处理库

// 字段映射说明：
// 模板优惠券：create_time → create_time；coupon_type → type；min_order_amount → min；discount_value → value
// 用户优惠券：receive_time → create_time；coupon_type → type；min_order_amount → min；discount_value → value
exports.getAllCoupon = [paginationMiddleware, async (req, res) => {
    try {
        const { currentPage, pageSize, offset, formatResult } = req.pagination;
        const { name, status, type, isTemplate } = req.query;
        const coupon_status = status;
        const coupon_type = type

        const whereConditions = [];
        const queryParams = [];
        let listSql = '';
        let countSql = '';

        // ==============================================
        // 1. 优惠券模板（只查 coupon 表）
        // ==============================================
        if (isTemplate === 'true') {
            listSql = `
                SELECT 
                coupon_id,
                name,
                type,
                discount_value,
                min_order_amount,
                start_time,
                end_time,
                status,
                create_time
                FROM coupon
                WHERE status = '已创建'
            `;
            countSql = `
        SELECT COUNT(*) AS total FROM coupon
        WHERE status = '已创建'
      `;
        }

        // ==============================================
        // 2. 用户优惠券（查 user_coupon + 关联 user 表）
        // ==============================================
        else {
            listSql = `
        SELECT 
        c.coupon_id AS id,
        c.name,
        c.type,
        c.discount_value,
        c.min_order_amount,
        c.start_time,
        c.end_time,
        c.status,
        c.create_time, 
        u.user_id,
        u.username
        FROM coupon c
        JOIN user u ON c.user_id = u.user_id
        WHERE c.status != '已创建'
      `;
            countSql = `
        SELECT COUNT(*) AS total FROM coupon c
        JOIN user u ON c.user_id = u.user_id
        WHERE c.status != '已创建'
      `;
        }

        // ==============================================
        // 公共筛选条件
        // ==============================================
        if (name) {
            whereConditions.push("name LIKE ?");
            queryParams.push(`%${name}%`);
        }
        if (coupon_type) {
            whereConditions.push("type = ?");
            queryParams.push(coupon_type);
        }
        if (coupon_status) {
            if (coupon_status === '已过期') {
                whereConditions.push("end_time < NOW()");
            } else {
                if (isTemplate === 'true') {
                    whereConditions.push("status = ?");
                } else {
                    whereConditions.push("c.status = ?");
                }
                queryParams.push(coupon_status); //只有非过期状态才用参数传值
            }

        }

        // 拼接条件
        if (whereConditions.length > 0) {
            const whereStr = " AND " + whereConditions.join(" AND ");
            listSql += whereStr;
            countSql += whereStr;
        }

        // 分页
        listSql += " LIMIT ? OFFSET ?";
        queryParams.push(pageSize, offset);

        // ==============================================
        // 执行查询
        // ==============================================
        const [list] = await db.query(listSql, queryParams);
        const [countResult] = await db.query(countSql, queryParams.slice(0, -2));

        // ==============================================
        // 数据格式化 + 计算有效时长
        // ==============================================
        const formattedList = list.map(item => {
            // 计算有效天数
            const startTime = dayjs(item.start_time);
            const endTime = dayjs(item.end_time);
            let validDays = 0;
            if (startTime.isValid() && endTime.isValid()) {
                validDays = endTime.diff(startTime, 'day') + 1; // 包含起止日
            }

            // 区分模板/用户优惠券，按前端格式映射字段
            if (isTemplate === 'true') {
                // 模板优惠券格式
                return {
                    coupon_id: item.coupon_id,
                    name: item.name,
                    type: item.type, // 映射为type
                    value: item.discount_value, // 映射为value
                    min: item.min_order_amount, // 映射为min
                    status: item.status, // 映射为status
                    create_time: dateUtils.formatIsoDate(item.create_time, false), // 模板创建时间格式化为YYYY-MM-DD HH:mm:ss格式
                    valid_days: validDays // 有效期天数
                };
            } else {
                // 用户优惠券格式
                return {
                    coupon_id: item.id, // 用户优惠券id
                    name: item.name,
                    type: item.type,
                    value: item.discount_value,
                    min: item.min_order_amount,
                    status: Date.now() < new Date(item.end_time) ? item.status : '已过期', // 已过期不分优惠券是否使用
                    create_time: dateUtils.formatIsoDate(item.create_time, false), // 领取时间对应create_time格式化为YYYY-MM-DD HH:mm:ss格式
                    valid_days: validDays,
                    user_id: item.user_id,
                    username: item.username
                };
            }
        });

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / pageSize);

        return res.json({
            status: 200,
            success: true,
            message: "获取优惠券列表成功",
            data: {
                list: formattedList,
                pagination: {
                    currentPage: currentPage,
                    pageSize: pageSize,
                    total: total,
                    totalPages: totalPages
                }
            }
        });

    } catch (err) {
        console.error("优惠券列表接口错误：", err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "服务器异常，请稍后重试",
            data: null
        });
    }
}]

//返回boolean
exports.updateCouponStatus = async (req, res) => {
    //console.log("【更新优惠券状态】", req.user)
    //console.log("【更新优惠券状态】请求体：", req.body)
    const { coupon_id, user_id, newCoupon, operation, isTemplate } = req.body;
    console.log("【更新优惠券状态】参数：", coupon_id, user_id, newCoupon, operation, isTemplate)

    // 必传参数校验
    if (!operation || isTemplate === undefined) {
        console.log("【更新优惠券状态】必要参数缺失")
        return res.status(400).json({
            status: 400,
            success: false,
            message: "参数缺失",
            data: null
        });
    }

    try {
        // ==============================================
        // 1）模板优惠券操作（删除 / 发全部 / 发VIP / 发指定用户）
        // ==============================================
        if (isTemplate == true) {
            console.log("模板操作")

            // ------------------------------
            // 删除模板优惠券
            // ------------------------------
            if (operation === 'delete') {
                // 安全验证：确保 coupon_id 是数组且不为空
                if (!Array.isArray(coupon_id) || coupon_id.length === 0) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "请传入有效的优惠券ID数组",
                        data: null
                    });
                }
                // 使用参数化查询，防止 SQL 注入
                const placeholders = coupon_id.map(() => '?').join(',');
                const deleteSql = `DELETE FROM coupon WHERE coupon_id IN (${placeholders})`;
                await db.query(deleteSql, coupon_id);
                return res.json({
                    status: 200,
                    success: true,
                    message: "模板优惠券删除成功",
                    data: true
                });
            }

            if (operation === 'create') {
                if (!newCoupon) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "缺少优惠券信息",
                        data: null
                    });
                }

                // 从 token 取出当前登录用户（创建人）
                const createUserId = req.user.user_id

                const {
                    name,
                    coupon_type,
                    value,
                    min_order_amount,
                    start_time,
                    end_time,
                    create_time,
                    coupon_status,
                } = newCoupon;

                // 必填字段验证
                if (!name || name.trim() === '') {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "优惠券名称不能为空",
                        data: null
                    });
                }

                // 时间顺序验证
                if (new Date(start_time) >= new Date(end_time)) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "开始时间必须早于结束时间",
                        data: null
                    });
                }

                // 验证最低消费金额
                if (Number(min_order_amount) < 0) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "最低消费金额不能小于0",
                        data: null
                    });
                }

                // 根据优惠券类型进行差异化验证
                if (coupon_type === '折扣') {
                    // 折扣券：折扣率必须在0.01-0.99之间（如0.9表示9折）
                    if (Number(value) < 0.01 || Number(value) > 0.99) {
                        return res.status(400).json({
                            status: 400,
                            success: false,
                            message: "折扣率必须在0.01-0.99之间",
                            data: null
                        });
                    }
                } else {
                    // 满减/秒杀券：金额必须≥1
                    if (Number(value) < 1) {
                        return res.status(400).json({
                            status: 400,
                            success: false,
                            message: "面额必须≥1",
                            data: null
                        });
                    }
                }

                // 满减/秒杀券：面额必须≥最低消费金额（折扣券不需要此判断）
                if (coupon_type !== '折扣' && Number(value) < Number(min_order_amount)) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "面额必须≥最低消费金额",
                        data: null
                    });
                }

                console.log("【创建优惠券】优惠券信息：", newCoupon)

                const insertSql = `
                    INSERT INTO coupon (
                    name, type, discount_value, min_order_amount,
                    start_time, end_time, create_time, status, user_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                await db.query(insertSql, [
                    name,
                    coupon_type,
                    value,
                    min_order_amount,
                    start_time,
                    end_time,
                    create_time,
                    coupon_status,
                    createUserId  // 创建人：来自token
                ]);

                return res.json({
                    status: 200,
                    success: true,
                    message: "优惠券创建成功",
                    data: true
                });
            }

            // ------------------------------
            // 先拿到优惠券模板（所有发放都需要）
            // ------------------------------
            const [couponList] = await db.query(
                "SELECT * FROM coupon WHERE coupon_id IN (?)",
                [coupon_id]
            );
            if (!couponList.length) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: "优惠券不存在",
                    data: null
                });
            }
            const coupon = couponList[0];

            // ------------------------------
            // 计算有效天数（原结束时间 - 原开始时间）
            // ------------------------------
            const startTime = new Date(coupon.start_time);
            const endTime = new Date(coupon.end_time);
            const validSeconds = (endTime - startTime) / 1000;

            // ------------------------------
            // 发放时使用：当前时间 和 当前时间+有效时长
            // ------------------------------
            const now = new Date();
            const newStartTime = now;
            const newEndTime = new Date(now.getTime() + validSeconds * 1000);

            // ------------------------------
            // 发放给全部普通用户
            // ------------------------------
            if (operation === 'toAll') {
                const [userList] = await db.query(
                    "SELECT user_id FROM user WHERE type = '普通用户'"
                );
                if (!userList.length) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "没有普通用户",
                        data: null
                    });
                }

                // 批量插入
                const values = userList.map(u => [
                    coupon.type,
                    coupon.discount_value,
                    coupon.min_order_amount,
                    newStartTime,
                    newEndTime,
                    '未使用',
                    coupon.name,
                    u.user_id
                ]);

                await db.query(`
                    INSERT INTO coupon (
                        type, discount_value, min_order_amount,
                        start_time, end_time, status, name, user_id
                    ) VALUES ?
                    `, [values]);

                return res.json({
                    status: 200,
                    success: true,
                    message: "已发放给全部普通用户",
                    data: true
                });
            }

            // ------------------------------
            // 发放给VIP用户
            // ------------------------------
            if (operation === 'toVip') {
                const [vipList] = await db.query(
                    "SELECT user_id FROM user WHERE type = '普通用户' AND is_vip = 1"
                );
                if (!vipList.length) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "没有VIP用户",
                        data: null
                    });
                }

                const values = vipList.map(u => [
                    coupon.type,
                    coupon.discount_value,
                    coupon.min_order_amount,
                    newStartTime,
                    newEndTime,
                    '未使用',
                    coupon.name,
                    u.user_id
                ]);

                await db.query(`
                    INSERT INTO coupon (
                        type, discount_value, min_order_amount,
                        start_time, end_time, status, name, user_id
                    ) VALUES ?
                    `, [values]);

                return res.json({
                    status: 200,
                    success: true,
                    message: "已发放给全部VIP用户",
                    data: true
                });
            }

            // ------------------------------
            // 发放给指定用户数组
            // ------------------------------
            if (operation === 'toUser') {
                if (!Array.isArray(user_id) || !user_id.length) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "请传入有效的用户ID数组",
                        data: null
                    });
                }

                const values = user_id.map(uid => [
                    coupon.type,
                    coupon.discount_value,
                    coupon.min_order_amount,
                    newStartTime,
                    newEndTime,
                    '未使用',
                    coupon.name,
                    uid
                ]);

                await db.query(`
                    INSERT INTO coupon (
                        type, discount_value, min_order_amount,
                        start_time, end_time, status, name, user_id
                    ) VALUES ?
                    `, [values]);

                return res.json({
                    status: 200,
                    success: true,
                    message: "已发放给指定用户",
                    data: true
                });
            }

            return res.status(400).json({
                status: 400,
                success: false,
                message: "不支持的操作类型",
                data: null
            });
        }

        // ==============================================
        // 2）非模板：批量删除过期优惠券
        // ==============================================
        else {
            if (operation === 'delete') {
                // 安全验证：确保 coupon_id 是数组且不为空
                if (!Array.isArray(coupon_id) || coupon_id.length === 0) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "请传入有效的优惠券ID数组",
                        data: null
                    });
                }
                // 使用参数化查询，防止 SQL 注入
                const placeholders = coupon_id.map(() => '?').join(',');
                const selectSql = `SELECT coupon_id FROM coupon WHERE coupon_id IN (${placeholders})`;
                const [expiredList] = await db.query(selectSql, coupon_id);
                if (!expiredList.length) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "没有过期优惠券",
                        data: null
                    });
                }
                const deleteSql = `DELETE FROM coupon WHERE coupon_id IN (${placeholders})`;
                await db.query(deleteSql, coupon_id);
                return res.json({
                    status: 200,
                    success: true,
                    message: "非模板优惠券过期删除成功",
                    data: true
                });
            }
        }

    } catch (err) {
        console.error("优惠券操作错误：", err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "服务器错误",
            data: null
        });
    }
};