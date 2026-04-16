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
                coupon_type,
                discount_value,
                min_order_amount,
                start_time,
                end_time,
                coupon_status,
                create_time
                FROM coupon
                WHERE coupon_status = '已创建'
            `;
            countSql = `
        SELECT COUNT(*) AS total FROM coupon
        WHERE coupon_status = '已创建'
      `;
        }

        // ==============================================
        // 2. 用户优惠券（查 user_coupon + 关联 user 表）
        // ==============================================
        else {
            listSql = `
        SELECT 
        coupon.coupon_id AS id,
        coupon.name,
        coupon.coupon_type,
        coupon.discount_value,
        coupon.min_order_amount,
        coupon.start_time,
        coupon.end_time,
        coupon.coupon_status,
        coupon.create_time, 
        user.user_id,
        user.username
        FROM coupon
        JOIN user ON coupon.user_id = user.user_id
        WHERE coupon.coupon_status != '已创建'
      `;
            countSql = `
        SELECT COUNT(*) AS total FROM coupon
        JOIN user ON coupon.user_id = user.user_id
        WHERE coupon.coupon_status != '已创建'
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
            whereConditions.push("coupon_type = ?");
            queryParams.push(coupon_type);
        }
        if (coupon_status) {
            whereConditions.push("coupon_status = ?");
            queryParams.push(coupon_status);
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
                    type: item.coupon_type, // 映射为type
                    value: item.discount_value, // 映射为value
                    min: item.min_order_amount, // 映射为min
                    status: item.coupon_status, // 映射为status
                    create_time: dateUtils.formatIsoDate(item.create_time, false), // 模板创建时间格式化为YYYY-MM-DD HH:mm:ss格式
                    valid_days: validDays // 有效期天数
                };
            } else {
                // 用户优惠券格式
                return {
                    coupon_id: item.id, // 用户优惠券id
                    name: item.name,
                    type: item.coupon_type,
                    value: item.discount_value,
                    min: item.min_order_amount,
                    status: item.coupon_status,
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
                const deleteSql = "DELETE FROM coupon WHERE coupon_id IN (?)";
                await db.query(deleteSql, [coupon_id]);
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
                //console.log("【创建优惠券】创建人：", createUserId)

                const {
                    //coupon_id,
                    name,
                    coupon_type,
                    value,
                    min_order_amount,
                    start_time,
                    end_time,
                    create_time,
                    coupon_status,
                } = newCoupon;

                console.log("【创建优惠券】优惠券信息：", newCoupon)

                const insertSql = `
                    INSERT INTO coupon (
                    name, coupon_type, discount_value, min_order_amount,
                    start_time, end_time, create_time, coupon_status, user_id
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
                    "SELECT user_id FROM user WHERE user_type = '普通用户'"
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
                    coupon.coupon_type,
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
                        coupon_type, discount_value, min_order_amount,
                        start_time, end_time, coupon_status, name, user_id
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
                    "SELECT user_id FROM user WHERE user_type = '普通用户' AND is_vip = 1"
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
                    coupon.coupon_type,
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
                        coupon_type, discount_value, min_order_amount,
                        start_time, end_time, coupon_status, name, user_id
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
                    coupon.coupon_type,
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
                        coupon_type, discount_value, min_order_amount,
                        start_time, end_time, coupon_status, name, user_id
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
                const selectSql = "SELECT coupon_id FROM coupon WHERE coupon_id IN (?)";
                const [expiredList] = await db.query(selectSql, [coupon_id]);
                if (!expiredList.length) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "没有过期优惠券",
                        data: null
                    });
                }
                const deleteIds = expiredList.map(item => item.coupon_id);
                console.log(deleteIds)
                const deleteSql = "DELETE FROM coupon WHERE coupon_id IN (?)";
                await db.query(deleteSql, [deleteIds]);
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