const db = require('@/config/database');
const paginationMiddleware = require('@/middlewares/paginationMiddleware');
const formatIsoDate = require('@/utils/date').formatIsoDate;

exports.getComment = [paginationMiddleware, async (req, res) => {
    const { goodsName, orderBy, isAppended } = req.query;
    const { currentPage, pageSize, offset, formatResult } = req.pagination;
    const loginUserId = req.user.user_id; // 当前登录的商家ID

    const baseUrl = 'http://localhost:8888';
    console.log("获取评论接口参数：", { goodsName, orderBy, isAppended, currentPage, pageSize })

    try {
        const conditions = [];
        const params = [];

        // ======================
        // 核心正确逻辑：
        // comment -> product -> shop -> user_id（商家ID）
        // ======================
        conditions.push(`s.user_id = ? AND c.parent_id IS NULL`);
        params.push(loginUserId);

        // 商品名称筛选
        if (goodsName) {
            conditions.push(`p.name LIKE ?`);
            params.push(`%${goodsName}%`);
        }

        // 是否追评筛选
        if (isAppended !== undefined && isAppended !== '') {
            if (isAppended === '1') {
                conditions.push(`c.is_appended = ?`);
                params.push(1);
            } else if (isAppended === '0') {
                conditions.push(`(c.is_appended != ? OR c.is_appended IS NULL)`);
                params.push(1);
            }
        }

        const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // 排序：不传不排
        let orderBySql = '';
        if (orderBy === 'desc') {
            orderBySql = 'ORDER BY c.rating DESC';
        } else if (orderBy === 'asc') {
            orderBySql = 'ORDER BY c.rating ASC';
        }


        // 统计总数
        const [countResult] = await db.query(`
            SELECT COUNT(DISTINCT c.review_id) AS total
            FROM comment c
            JOIN product p ON p.product_id = c.product_id
            JOIN shop s ON s.shop_id = p.shop_id
            ${whereSql}
        `, params);
        const total = countResult[0].total;

        console.log("查询条件，排序", whereSql, "排序", orderBySql, "参数", params)

        // =============================
        // 最终正确查询：不重复、数量正确
        // =============================
        const [rows] = await db.query(`
            SELECT DISTINCT
                c.review_id AS comment_id,
                c.order_id AS orderId,
                p.name AS goodsName,
                c.comment_status AS status,
                u.username AS username,
                c.comment AS content,
                c.rating AS score,
                c.create_time AS createTime,
                od.quantity AS buyNumber,
                c.images AS images,
                c.video AS video,
                c.is_appended AS isAppended, 
                c.append_content AS appendContent, 
                c.append_time AS appendTime, 
                c.append_images AS appendImages,
                c.append_video AS appendVideo,
                CASE WHEN EXISTS (
                    SELECT 1 FROM comment c2 
                    WHERE c2.parent_id = c.review_id
                ) THEN 1 ELSE 0 END AS merchantReplied
            FROM comment c

            -- 商品
            JOIN product p
                ON p.product_id = c.product_id

            -- 店铺（用来判断是不是自己的店铺）
            JOIN shop s
                ON s.shop_id = p.shop_id

            -- 评论的用户（不是商家）
            LEFT JOIN user u
                ON u.user_id = c.user_id

            -- 订单详情，获取购买数量（通过 order_id）
            LEFT JOIN order_details od
                ON od.order_id = c.order_id

            ${whereSql}
            ${orderBySql}
            LIMIT ? OFFSET ?
        `, [...params, pageSize, offset]);



        // 去重，保证一条评论只出现一次
        //const seen = new Set();
        const commentList = rows.map(item => ({
            comment_id: item.comment_id,
            orderId: item.orderId,
            goodsName: item.goodsName,
            username: item.username,
            content: item.content,
            score: item.score,
            createTime: formatIsoDate(item.createTime, false),
            status: item.status,
            buyNumber: item.buyNumber,
            mediaUrls: [
                ...(item.images ? item.images.split(',').map(img => baseUrl + img.trim()) : []),
                ...(item.video ? item.video.split(',').map(vid => baseUrl + vid.trim()) : [])
            ],
            isAppended: item.isAppended,
            appendContent: item.appendContent,
            appendTime: formatIsoDate(item.appendTime, false),
            appendMediaUrls: [
                ...(item.appendImages ? item.appendImages.split(',').map(img => baseUrl + img.trim()) : []),
                ...(item.appendVideo ? item.appendVideo.split(',').map(vid => baseUrl + vid.trim()) : [])
            ],
            isNotReply: item.merchantReplied === 0,
        }));

        console.log(commentList)

        return res.json({
            status: 200,
            success: true,
            message: "获取评论成功",
            data: { commentList, pagination: formatResult(total) }
        });

    } catch (err) {
        console.error("评论接口错误：", err);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "服务器错误",
            data: { commentList: [], pagination: formatResult(0) }
        });
    }
}];


exports.updateComment = async (req, res) => {
    const { comment_id, operation } = req.body;
    console.log("更新评论状态:", comment_id, operation)

    //report -> 举报评论，status改为"待审核"
    //reply -> 回复评论，parent_id改为商家回复的评论ID

    try {
        if (!['report', 'reply'].includes(operation)) {
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
        //const { field, value } = operationMap[operation];
        if (operation === 'report') {
            // 举报评论
            await db.query(`
                UPDATE \`comment\`
                SET comment_status='待审核'
                WHERE review_id = ?
            `, comment_id);
        } else {
            const { replyComment } = req.body;
            const { user_id } = req.user
            console.log("回复评论:", replyComment)
            // 获取product_id和user_id（商家回复的评论ID）
            const [parentRow] = await db.query(`
                SELECT product_id FROM comment WHERE review_id = ?
            `, [comment_id]);
            console.log(parentRow)
            if (!parentRow) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: '评论不存在',
                    data: {
                        comment_id
                    }
                });
            }
            const [result] = await db.query(`
                INSERT INTO \`comment\`
                (product_id, user_id,order_id, comment,rating,comment_status, parent_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [parentRow[0].product_id, user_id, replyComment.orderId, replyComment.comment, 5, replyComment.comment_status, replyComment.parent_id]);
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
