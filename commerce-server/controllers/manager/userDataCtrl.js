const db = require('@/config/database');
const formatIsoDate = require('@/utils/date').formatIsoDate;

exports.userData = async (req, res) => {
    try {
        console.log(req.query);
        const {
            username,
            type,
            status,
            page = 1,    // 新增：默认第1页
            pageSize = 10 // 新增：默认每页10条
        } = req.query;

        // 分页参数处理（转数字+边界值校验）
        const currentPage = Math.max(1, Number(page)); // 页码最小为1
        const size = Math.max(1, Math.min(50, Number(pageSize))); // 每页条数限制1-50
        const offset = (currentPage - 1) * size; // 计算偏移量

        let userType = '';
        let is_vip = '';
        if (type) {
            if (type === '管理员') {
                userType = '管理员';
            } else if (type === '商家') {
                userType = '商家';
            } else if (type === '普通用户') {
                userType = '普通用户';
                is_vip = 0;
            } else if (type === 'vip用户') {
                userType = '普通用户';
                is_vip = 1;
            }
        }
        let statusQuery = '';
        if (status) {
            statusQuery = `%${status}%`;
        }

        // 1. 构建查询总数的SQL（保留原有筛选条件）
        let countSql = `SELECT COUNT(*) AS total FROM user WHERE 1=1`;
        // 2. 构建查询列表的SQL（保留原有筛选条件）
        let listSql = `SELECT * FROM user WHERE 1=1`;
        let params = []; // 防注入占位符参数

        // 用户名筛选（同时作用于总数和列表查询）
        if (username) {
            countSql += ` AND username LIKE ?`;
            listSql += ` AND username LIKE ?`;
            params.push(`%${username}%`);
        }

        // 类型筛选（同时作用于总数和列表查询）
        if (userType) {
            countSql += ` AND user_type = ?`;
            listSql += ` AND user_type = ?`;
            params.push(userType);
        }

        // VIP 筛选（同时作用于总数和列表查询）
        if (is_vip !== '') {
            countSql += ` AND is_vip = ?`;
            listSql += ` AND is_vip = ?`;
            params.push(is_vip);
        }

        // 状态筛选（同时作用于总数和列表查询）
        if (status) {
            countSql += ` AND user_status LIKE ?`;
            listSql += ` AND user_status LIKE ?`;
            params.push(statusQuery);
        }

        // 列表查询添加分页（MySQL LIMIT 语法）
        listSql += ` LIMIT ? OFFSET ?`;
        // 分页参数追加到params（注意：先size后offset）
        const listParams = [...params, size, offset];

        // 执行查询：先查总数，再查列表
        const [countResult, listResult] = await Promise.all([
            db.query(countSql, params),
            db.query(listSql, listParams)
        ]);
        console.log("总数SQL：", countSql, params);
        console.log("列表SQL：", listSql, listParams);

        const total = countResult[0][0].total; // 总条数
        const totalPages = Math.ceil(total / size); // 总页数

        // 处理列表数据（原有逻辑完全保留）
        const userList = listResult[0].map(item => ({
            user_id: item.user_id,
            username: item.username,
            type: item.user_type == "普通用户" ? item.is_vip == 0 ? "普通用户" : "VIP用户" : item.user_type,
            phone: item.phone || '',
            email: item.email || '',
            is_vip: item.is_vip ? true : false,
            age: item.age || null,
            gender: item.gender || '',
            create_time: formatIsoDate(item.create_time),
            status: item.user_status,
            avatar: item.img || '',
            update_time: formatIsoDate(item.update_time)
        }));
        //console.log("userList:", userList);

        // 响应数据新增分页信息
        res.json({
            message: '查询用户数据成功',
            status: 200,
            success: true,
            data: {
                userList: userList,       // 分页列表数据
                pagination: {         // 分页信息
                    currentPage,      // 当前页码
                    pageSize: size,   // 每页条数
                    total,            // 总条数
                    totalPages        // 总页数
                }
            }
        });
    } catch (error) {
        // 新增异常捕获，避免服务崩溃
        console.error("用户列表查询异常：", error);
        res.json({
            message: '服务器异常，查询用户数据失败',
            status: 500,
            success: false,
            data: {
                list: [],
                pagination: {
                    currentPage: 1,
                    pageSize: 10,
                    total: 0,
                    totalPages: 0
                }
            }
        });
    }
};

exports.updateManagerUserList = async (req, res) => {
    try {
        const { user_id, operation } = req.body;
        console.log(req.body)
        console.log(user_id, operation)

        // 1. 必传参数校验
        if (!user_id || !Array.isArray(user_id) || user_id.length === 0 || !operation) {
            return res.json({
                success: false,
                data: false,
                message: "参数错误：必须传入用户ID数组和操作类型"
            });
        }

        // 2. 定义操作映射（你前端传 operation 字段）
        const operationMap = {
            disable: { field: 'user_status', value: '禁用' },   // 禁用
            enable: { field: 'user_status', value: '正常' },   // 启用
            setVip: { field: 'is_vip', value: 1 },        // 设置VIP
            cancelVip: { field: 'is_vip', value: 0 },     // 取消VIP
            delete: { field: 'is_delete', value: 1 },     // 删除
        };

        // 3. 判断是否支持该操作
        const op = operationMap[operation];
        if (!op) {
            return res.json({
                success: false,
                data: false,
                message: "不支持的操作类型"
            });
        }

        if (op == 'delete') {
            // 删除用户
            const sql = `delete from user WHERE user_id IN (?)`;
            const [result] = await db.query(sql, [user_id]);
            if (result.affectedRows === 0) {
                return res.json({
                    success: false,
                    data: false,
                    message: "用户不存在或已被删除"
                });
            }
            return res.json({
                success: true,
                data: true,
                message: "用户删除成功"
            });
        }

        // 4. 批量更新SQL（支持同时修改多个用户）
        const sql = `UPDATE user SET ?? = ? WHERE user_id IN (?)`;
        const [result] = await db.query(sql, [op.field, op.value, user_id]);

        // 5. 返回布尔值（匹配你的前端 request<boolean>）
        const success = result.affectedRows > 0;

        res.json({
            status: 200,
            success: success,
            data: success,
            message: success ? `操作成功，共影响 ${result.affectedRows} 个用户` : "没有用户被修改"
        });

    } catch (err) {
        console.error("批量操作用户失败：", err);
        res.json({
            status: 500,
            success: false,
            data: false,
            message: "服务器错误，操作失败"
        });
    }
};