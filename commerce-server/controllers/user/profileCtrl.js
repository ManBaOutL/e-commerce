const db = require('@/config/database');
const path = require('path');
const fs = require('fs');

const {verifyCodeStore} = require('@/controllers/front/loginCtrl')

// 🌟 1. 更新个人资料
exports.updateProfile = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { username, img, email, phone, age, gender, code } = req.body;

    try {
        // 1. 如果传了 code，说明前端改了敏感联系方式，需要校验验证码
        if (code) {
            const storedData = verifyCodeStore[phone] || verifyCodeStore[email];
            const now = Date.now();

            if (!storedData || now > storedData.expireTime) {
                return res.status(400).json({ success: false, message: '验证码已过期或不存在' });
            }
            if (storedData.code !== code) {
                return res.status(400).json({ success: false, message: '验证码错误' });
            }

            // 验证成功后销毁该验证码
            delete verifyCodeStore[phone];
            delete verifyCodeStore[email];
        }

        // 2. 检查用户名是否与其他用户冲突
        const [existUser] = await db.execute(
            `SELECT user_id FROM user WHERE username = ? AND user_id != ?`, 
            [username, user_id]
        );
        if (existUser.length > 0) {
            return res.status(400).json({ success: false, message: '该用户名已被占用' });
        }

        // 3. 处理头像图片“转正”到专属用户目录 ---
        let finalImgPath = img;
        
        // 如果前端传过来的路径包含 '/upload/temp/'，说明是刚刚通过 /api/user/media/upload 传上来的新头像
        if (img && img.includes('/upload/temp/')) {
            const fileName = path.basename(img);
            const tempAbsPath = path.join(process.cwd(), 'public', 'upload', 'temp', fileName);
            
            // 动态生成该用户的专属目录: /public/upload/avatars/{user_id}
            const targetDir = path.join(process.cwd(), 'public', 'upload', 'avatars', String(user_id));
            const targetAbsPath = path.join(targetDir, fileName);

            // 如果该用户的专属目录不存在，则递归创建
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // 将文件从 temp 剪切到用户的专属目录
            if (fs.existsSync(tempAbsPath)) {
                fs.renameSync(tempAbsPath, targetAbsPath); 
                // 更新最终入库的相对路径
                finalImgPath = `/upload/avatars/${user_id}/${fileName}`; 
            }
        }

        // --- 执行数据库更新 ---
        const [result] = await db.execute(
            `UPDATE user 
             SET username = ?, img = ?, email = ?, phone = ?, age = ?, gender = ? 
             WHERE user_id = ?`,
            [username, finalImgPath || null, email, phone, age || null, gender, user_id]
        );

        if (result.affectedRows > 0) {
            // 🌟 返回转正后的路径给前端更新 store
            res.json({ 
                success: true, 
                message: '资料更新成功', 
                status: 200,
                data: { avatar: finalImgPath } 
            });
        } else {
            res.status(400).json({ success: false, message: '资料未发生变更或更新失败' });
        }

    } catch (err) {
        console.error('更新个人资料异常:', err);
        res.status(500).json({ success: false, message: '服务器异常' });
    }
};