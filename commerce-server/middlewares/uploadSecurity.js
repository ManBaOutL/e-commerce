// 文件上传安全校验中间件

// 允许的文件类型白名单
const ALLOWED_MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm'
};

// 允许的文件扩展名
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm'];

// 最大文件大小（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 安全文件名正则（只允许字母、数字、下划线、中划线）
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_-]+$/;

exports.validateUpload = (req, res, next) => {
    try {
        // 检查是否有文件
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的文件',
                status: 400
            });
        }

        const files = Array.isArray(req.files) ? req.files : Object.values(req.files);

        for (const file of files) {
            // 1. 检查文件大小
            if (file.size > MAX_FILE_SIZE) {
                return res.status(400).json({
                    success: false,
                    message: `文件大小超过限制（最大5MB）`,
                    status: 400
                });
            }

            // 2. 检查 MIME 类型
            if (!ALLOWED_MIME_TYPES[file.mimetype]) {
                return res.status(400).json({
                    success: false,
                    message: `不支持的文件类型: ${file.mimetype}`,
                    status: 400
                });
            }

            // 3. 检查文件扩展名
            const ext = file.name.split('.').pop().toLowerCase();
            const expectedExt = ALLOWED_MIME_TYPES[file.mimetype];
            if (!ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
                return res.status(400).json({
                    success: false,
                    message: `不支持的文件扩展名: .${ext}`,
                    status: 400
                });
            }

            // 4. 验证文件扩展名与 MIME 类型匹配
            if (`.${ext}` !== expectedExt && !expectedExt.includes(`.${ext}`)) {
                return res.status(400).json({
                    success: false,
                    message: '文件扩展名与内容类型不匹配',
                    status: 400
                });
            }

            // 5. 检查文件名安全性（防止路径遍历攻击）
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            if (!SAFE_FILENAME_REGEX.test(baseName)) {
                return res.status(400).json({
                    success: false,
                    message: '文件名包含非法字符',
                    status: 400
                });
            }

            // 6. 防止路径遍历攻击
            if (file.name.includes('/') || file.name.includes('\\')) {
                return res.status(400).json({
                    success: false,
                    message: '文件名不能包含路径分隔符',
                    status: 400
                });
            }
        }

        next();
    } catch (err) {
        console.error('文件上传校验异常:', err);
        return res.status(500).json({
            success: false,
            message: '文件上传校验失败',
            status: 500
        });
    }
};

// 生成安全的文件名
exports.generateSafeFilename = (originalName, prefix = '') => {
    const ext = originalName.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    return `${prefix}${timestamp}_${randomStr}.${ext}`;
};