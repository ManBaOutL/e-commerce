const express = require('express');
const router = express.Router();
const upload = require('@/utils/upload'); // 引入上传中间件

// 🌟 通用文件上传接口
// upload.single('file') 表示处理前端表单中 name 为 'file' 的单个文件上传
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '请选择要上传的文件' });
        }

        // 🌟 核心修复点：文件既然存到了 temp，就要老老实实返回 temp 的路径！
        // 删掉之前的 isVideo 判断逻辑，统统返回 /upload/temp/
        const folder = '/upload/temp/';
        const fileUrl = folder + req.file.filename;

        res.json({
            success: true,
            message: '上传成功',
            status: 200,
            data: {
                url: fileUrl,          // 返回: /upload/temp/123456.jpg
                name: req.file.filename 
            }
        });
    } catch (err) {
        console.error('上传接口异常:', err);
        res.status(500).json({ success: false, message: '文件上传失败' });
    }
});

// 统一捕获 Multer 的特殊错误 (比如文件过大)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: '文件大小不能超过 5MB' });
        }
    } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
});

module.exports = router;