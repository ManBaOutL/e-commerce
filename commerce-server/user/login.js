// 登录路由
const express = require('express')
const router = express.Router()
const db = require('../database')

router.post('/login', async (req, res) => {
    console.log(req.body)
    const { phone, username, email, password, type } = req.body
    let query = '' // 登录查询语句
    if (type === 'username') {
        query = `SELECT * FROM user WHERE username = \'${username}\'`
    } else if (type === 'email') {
        query = `SELECT * FROM user WHERE email = \'${email}\'`
    } else if (type === 'phone') {
        query = `SELECT * FROM user WHERE phone = \'${phone}\'`
    } else {
        return res.status(400).json({ message: '登录类型错误' })
    }
    //console.log(query)
    try {
        const [rows] = await db.execute(query)
        if (rows.length === 0) {
            return res.status(401).json({ message: '用户名不存在' })
        }
        const user = rows[0]
        if (user.password !== password) {
            return res.status(401).json({ message: '密码错误' })
        }
        res.json({ message: '登录成功', data: user, status: 200, success: true })
    } catch (err) {
        // 只打印关键错误，不打印完整堆栈（避免刷屏）
        console.error(`登录错误[${new Date().toLocaleTimeString()}]：`, err.message);

        // 按错误类型返回友好提示（不暴露底层细节）
        if (err.message.includes('Table')) {
            res.status(404).json({ success: false, message: '数据库表不存在，请检查表名' });
        } else if (err.message.includes('undefined')) {
            res.status(400).json({ success: false, message: '参数格式错误' });
        } else {
            res.status(500).json({ success: false, message: '服务器内部错误' });
        }
    }
})

module.exports = router