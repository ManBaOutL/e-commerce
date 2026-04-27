const db = require('@/config/database');
const fs = require('fs');
const path = require('path');

// 🌟 辅助工具函数：将文件从 temp 移动到正式目录
const transferTempFile = (tempUrl, type) => {
    // 如果没有路径，或者根本不在 temp 目录下，直接返回原值（防呆设计）
    if (!tempUrl || !tempUrl.includes('/upload/temp/')) return tempUrl;

    const fileName = path.basename(tempUrl);
    const targetFolder = type === 'video' ? '/upload/comment/video/' : '/upload/comment/img/';
    const targetAbsDir = path.join(process.cwd(), 'public', targetFolder);

    // 确保正式目录存在
    if (!fs.existsSync(targetAbsDir)) {
        fs.mkdirSync(targetAbsDir, { recursive: true });
    }

    const oldAbsPath = path.join(process.cwd(), 'public', tempUrl);
    const newAbsPath = path.join(targetAbsDir, fileName);

    // 执行物理移动
    if (fs.existsSync(oldAbsPath)) {
        fs.renameSync(oldAbsPath, newAbsPath); // 从 temp 剪切到正式目录
        return targetFolder + fileName;        // 返回新的正式网络路径
    }
    return null;
};

// 添加商品评价
exports.addComment = async (req, res) => {
    const { order_id, product_id, rating, content, images, video } = req.body;
    const user_id = req.user.user_id || req.user.id; 

    try {
        // 1. 安全校验 (判断订单是否合法等，保留你原有的校验代码)
        const [orders] = await db.execute(
            `SELECT status FROM \`order\` WHERE order_id = ? AND user_id = ?`,
            [order_id, user_id]
        );
        if (orders.length === 0 || orders[0].status !== '已完成') {
            return res.json({ success: false, message: '只能对已完成的订单进行评价' });
        }

        // 🌟 2. 核心：处理文件“转正”
        let finalImagesUrls = [];
        if (images) {
            // 前端传过来的是逗号分隔的 temp 路径 "/upload/temp/a.jpg,/upload/temp/b.jpg"
            const imgArray = images.split(',');
            for (let img of imgArray) {
                const newUrl = transferTempFile(img, 'image');
                if (newUrl) finalImagesUrls.push(newUrl);
            }
        }
        
        let finalVideoUrl = null;
        if (video) {
            finalVideoUrl = transferTempFile(video, 'video');
        }

        const finalImagesStr = finalImagesUrls.length > 0 ? finalImagesUrls.join(',') : null;

        // 3. 执行写入数据库（使用转正后的新路径！）
        await db.execute(
            `INSERT INTO \`comment\` (product_id, user_id, order_id, rating, comment, images, video, comment_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, '正常')`,
            [product_id, user_id, order_id, rating, content, finalImagesStr, finalVideoUrl]
        );

        res.json({ status: 200, success: true, message: '评价发布成功！' });
    } catch (err) {
        console.error('添加评论错误：', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};

// 追加商品评价 (追评)
exports.appendComment = async (req, res) => {
    const { review_id, content, images, video } = req.body;
    const user_id = req.user.user_id || req.user.id;

    try {
        // 1. 查出原评价并进行严格校验
        const [reviews] = await db.execute(
            `SELECT user_id, create_time, is_appended 
             FROM \`comment\` 
             WHERE review_id = ?`,
            [review_id]
        );

        if (reviews.length === 0) {
            return res.status(404).json({ success: false, message: '原评价不存在' });
        }

        const originalReview = reviews[0];

        // 校验 1: 是否是本人的评价 (防越权)
        if (originalReview.user_id !== user_id) {
            return res.status(403).json({ success: false, message: '无权操作他人的评价' });
        }

        // 校验 2: 是否已经追评过 (防重复追评)
        if (originalReview.is_appended === 1) {
            return res.status(400).json({ success: false, message: '您已经追加过评价了，无法再次追评' });
        }

        // 校验 3: 是否超出追评时效 (假设限制 90 天内)
        const now = new Date();
        const createTime = new Date(originalReview.create_time);
        const diffTime = Math.abs(now - createTime);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays > 90) {
             return res.status(400).json({ success: false, message: '已超过 90 天追评时效，无法追评' });
        }

        // 2. 处理文件“转正” (复用之前的 transferTempFile 函数)
        let finalImagesUrls = [];
        if (images) {
            const imgArray = images.split(',');
            for (let img of imgArray) {
                const newUrl = transferTempFile(img, 'image');
                if (newUrl) finalImagesUrls.push(newUrl);
            }
        }
        
        let finalVideoUrl = null;
        if (video) {
            finalVideoUrl = transferTempFile(video, 'video');
        }

        const finalImagesStr = finalImagesUrls.length > 0 ? finalImagesUrls.join(',') : null;

        // 3. 执行更新，写入追评数据
        await db.execute(
            `UPDATE \`comment\` 
             SET is_appended = 1, 
                 append_content = ?, 
                 append_images = ?, 
                 append_video = ?, 
                 append_time = NOW(), 
                 append_days = ? 
             WHERE review_id = ?`,
            [content, finalImagesStr, finalVideoUrl, diffDays, review_id]
        );

        res.json({ status: 200, success: true, message: '追评发布成功！' });

    } catch (err) {
        console.error('追评操作异常:', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};

//  获取我的评价列表
exports.getMyComments = async (req, res) => {
    // 解析当前登录用户的 ID
    const user_id = req.user.user_id || req.user.id;
    
    try {
        // 核心 SQL：联表查询商品信息，且必须排除状态为 '用户删除' 的记录
        const [rows] = await db.execute(`
            SELECT c.review_id, c.order_id, c.product_id, c.rating, c.comment, c.images,
                   DATE_FORMAT(c.create_time, '%Y-%m-%d %H:%i') as create_time,
                   c.is_appended, c.append_content, c.append_images,
                   DATE_FORMAT(c.append_time, '%Y-%m-%d %H:%i') as append_time,
                   p.name as product_name
            FROM \`comment\` c
            JOIN product p ON c.product_id = p.product_id
            WHERE c.user_id = ? 
              AND c.comment_status != '删除' 
              AND c.parent_id IS NULL  -- 只查首评主记录
            ORDER BY c.create_time DESC
        `, [user_id]);

        // 数据清洗与组装
        for (let i = 0; i < rows.length; i++) {
            // 1. 字符串转数组
            rows[i].images = rows[i].images ? rows[i].images.split(',') : [];
            rows[i].append_images = rows[i].append_images ? rows[i].append_images.split(',') : [];

            // 2. 组装商品主图 (这里使用最通用的相对路径组装方式，如果有更精确的主图字段可以替换)
            rows[i].product_image = `/upload/product/img/${rows[i].product_id}/1.jpg`;

            // 3. 查找是否包含商家回复
            const [replies] = await db.execute(
                `SELECT comment FROM \`comment\` WHERE parent_id = ? LIMIT 1`,
                [rows[i].review_id]
            );
            if (replies.length > 0) {
                rows[i].merchant_reply = replies[0].comment;
            }
        }

        res.json({ success: true, status: 200, data: rows });
    } catch (err) {
        console.error('获取我的评价失败:', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};

// 删除评价 (企业级：软删除)
exports.deleteComment = async (req, res) => {
    const { review_id } = req.body;
    const user_id = req.user.user_id || req.user.id;

    try {
        // 🚨 核心防线：必须带上 user_id = ? 防止越权删除别人的评论
        const [result] = await db.execute(
            `UPDATE \`comment\` 
             SET comment_status = '删除' 
             WHERE review_id = ? AND user_id = ?`,
            [review_id, user_id]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '评价已成功删除', status: 200, data: result });
        } else {
            res.status(400).json({ success: false, message: '删除失败，该评价不存在或无权操作', status: 400, data: {} });
        }
    } catch (err) {
        console.error('删除评价异常:', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};