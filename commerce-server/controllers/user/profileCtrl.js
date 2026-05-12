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

// 模拟账户充值
exports.recharge = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const amount = Number(req.body.amount);

    // ==========================================
    // 🛡️ 1. 单次交易额度限制拦截
    // ==========================================
    const MIN_RECHARGE = 0.01;
    const MAX_RECHARGE = 50000; // 单次最高 5 万

    if (!amount || amount < MIN_RECHARGE) {
        return res.status(400).json({ success: false, message: `充值金额异常，不能低于 ¥${MIN_RECHARGE}` });
    }
    if (amount > MAX_RECHARGE) {
        return res.status(400).json({ success: false, message: `风控拦截：单次充值金额不能超过 ¥${MAX_RECHARGE}` });
    }

    // 🌟 开启事务，防止并发充值
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // ==========================================
        // 🛡️ 2. 账户总容量限制拦截 (锁行查询)
        // ==========================================
        const MAX_BALANCE = 999999.99; // 假设平台规定普通用户账户最多存放 100 万

        // FOR UPDATE 会锁住该用户的这行数据，直到事务提交，彻底杜绝并发刷钱
        const [users] = await connection.execute(`SELECT balance FROM user WHERE user_id = ? FOR UPDATE`, [user_id]);
        
        const currentBalance = Number(users[0].balance || 0);

        if (currentBalance + amount > MAX_BALANCE) {
            throw new Error(`充值失败：您的账户总余额将超过系统上限 (¥${MAX_BALANCE})`);
        }

        // ==========================================
        // 💰 3. 安全更新余额
        // ==========================================
        await connection.execute(`UPDATE user SET balance = balance + ? WHERE user_id = ?`, [amount, user_id]);
        
        // 提交事务
        await connection.commit();
        res.json({ success: true, message: '充值成功', status: 200 });

    } catch (err) {
        // 发生错误，回滚数据
        await connection.rollback();
        console.error('充值异常:', err);
        res.status(400).json({ success: false, message: err.message || '系统繁忙，充值失败' });
    } finally {
        // 释放数据库连接
        connection.release();
    }
};

// 模拟账户提现 (加锁防止高并发透支)
exports.withdraw = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: '提现金额无效' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [users] = await connection.execute(`SELECT balance FROM user WHERE user_id = ? FOR UPDATE`, [user_id]);
        console.log("用户",users);
        
        if (users.length === 0 || Number(users[0].balance) < amount) {
            throw new Error('账户余额不足');
        }

        await connection.execute(`UPDATE user SET balance = balance - ? WHERE user_id = ?`, [amount, user_id]);
        await connection.commit();

        res.json({ success: true, message: '提现成功', status: 200 });
    } catch (err) {
        await connection.rollback();
        console.error('提现失败:', err);
        res.status(400).json({ success: false, message: err.message || '提现失败,请重新操作' });
    } finally {
        connection.release();
    }
};

// 获取当前登录用户的最新信息（一些敏感信息不返回）
exports.getUserInfo = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    try {
        const [rows] = await db.execute('SELECT balance, is_vip FROM user WHERE user_id = ?', [user_id]);
        res.json({ success: true, status: 200, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: '获取信息失败' });
    }
}