// 忘记密码路由
const express = require('express')
const router = express.Router()
const db = require('../database')
const { verifyCodeStore } = require('./code');

router.post('/forget', async (req, res) => {
    console.log("忘记密码请求:", req.body);
    const { phone, email, code, newPwd, repeatPwd, type } = req.body;
    //console.log(verifyCodeStore);
    // 处理重置密码逻辑
    //判断是手机号重置还是邮箱重置
    let storedCode = null;
    if (type === 'phone') {
        storedCode = verifyCodeStore[phone];
    } else if (type === 'email') {
        storedCode = verifyCodeStore[email];
    }
    //console.log("storedCode:", storedCode);
    const now = Date.now();
    //检查是否存在未填
    if ((!phone && !email) || !code || !newPwd || !repeatPwd) {
        console.log("请填写完整信息");
        return res.json({ status: 400, message: '请填写完整信息' });
    }
    // 检查验证码是否过期
    if (now - storedCode.expireTime > 0) {
        //销毁过期验证码
        if (type === 'phone') {
            delete verifyCodeStore[phone];
        } else if (type === 'email') {
            delete verifyCodeStore[email];
        }
        console.log("验证码已过期");
        return res.json({ status: 400, message: '验证码已过期' });
    }
    if (!storedCode.code || storedCode.code !== code) {
        console.log("验证码错误");
        return res.status(400).json({ message: '验证码错误' });
    }
    if (newPwd !== repeatPwd) {
        console.log("两次密码不一致");
        return res.status(400).json({ message: '两次密码不一致' });
    }
    try {
        const allowedTypes = ['phone', 'email'];
        if (!allowedTypes.includes(type)) {
            return res.json({ status: 400, msg: '无效的重置类型' });
        }
        const resetType = type === 'phone' ? 'phone' : 'email';
        const resetData = type === 'phone' ? phone : email;
        const sql = `UPDATE user SET password = ? WHERE ${resetType} = ?`;
        // 执行数据库更新操作
        const [rows] = await db.execute(sql, [newPwd, resetData])
        console.log('调试用完整语句：', `UPDATE user SET password = '${newPwd}' WHERE ${resetType} = '${resetData}'`);
        if (rows.affectedRows === 0) {
            return res.status(400).json({ message: '忘记密码失败' })
        }
        res.json({ message: '忘记密码成功', data: rows, status: 200, success: true })
        // 重置成功后，销毁验证码
        if (type === 'phone') {
            delete verifyCodeStore[phone];
        } else if (type === 'email') {
            delete verifyCodeStore[email];
        }
    } catch (err) {
        // 只打印关键错误，不打印完整堆栈（避免刷屏）
        console.error(`忘记密码错误[${new Date().toLocaleTimeString()}]：`, err.message);
    }
})

module.exports = router