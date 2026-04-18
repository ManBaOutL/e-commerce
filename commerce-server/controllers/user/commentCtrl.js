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