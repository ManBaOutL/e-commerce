// utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 允许的文件类型白名单
const ALLOWED_MIME_TYPES = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'video/mp4', 
    'video/webm'
];

// 安全文件名正则（只允许字母、数字、下划线、中划线）
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_-]+$/;

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
        // 🌟 安全文件名生成：使用时间戳+随机数，避免路径遍历攻击
        const extname = path.extname(file.originalname).toLowerCase();
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + extname;
        cb(null, uniqueName);
    }
});

// 2. 配置文件过滤规则 (防黑客上传木马脚本)
const fileFilter = (req, file, cb) => {
    // 检查 MIME 类型
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(new Error('不支持的文件类型，仅支持 JPG/PNG/GIF/WEBP/SVG/MP4/WEBM'), false);
        return;
    }

    // 检查原始文件名安全性（防止路径遍历攻击）
    const originalName = file.originalname;
    
    // 禁止包含路径分隔符
    if (originalName.includes('/') || originalName.includes('\\')) {
        cb(new Error('文件名不能包含路径分隔符'), false);
        return;
    }

    // 验证文件名（不含扩展名）
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    if (!SAFE_FILENAME_REGEX.test(baseName)) {
        cb(new Error('文件名包含非法字符'), false);
        return;
    }

    cb(null, true); // 允许上传
};

// 3. 实例化 Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件最大为 5MB，和前端保持一致
    }
});

// 生成安全的文件名
exports.generateSafeFilename = (originalName, prefix = '') => {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    return `${prefix}${timestamp}_${randomStr}${ext}`;
};

module.exports = upload;