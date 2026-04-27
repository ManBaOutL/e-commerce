// utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. 配置文件存储规则
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 🌟 企业标准 1：所有上传的文件，第一时间全部扔进 temp 临时目录
        const tempPath = '/upload/temp/';
        const absPath = path.join(process.cwd(), 'public', tempPath);

        if (!fs.existsSync(absPath)) {
            fs.mkdirSync(absPath, { recursive: true });
        }
        cb(null, absPath);
    },
    filename: function (req, file, cb) {
        const extname = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E6) + extname;
        cb(null, uniqueName);
    }
});

// 2. 配置文件过滤规则 (防黑客上传木马脚本)
const fileFilter = (req, file, cb) => {
    // 允许上传的 MIME 类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // 允许上传
    } else {
        cb(new Error('不支持的文件类型，仅支持 JPG/PNG/GIF/WEBP/MP4'), false); // 拒绝上传
    }
};

// 3. 实例化 Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件最大为 5MB，和前端保持一致
    }
});

module.exports = upload;