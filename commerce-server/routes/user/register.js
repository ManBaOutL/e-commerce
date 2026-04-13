// 注册路由
const express = require('express')
const router = express.Router()
const db = require('@/config/database')

router.post('/register', async (req, res) => {
    console.log("注册请求:", req.body)
    const { username, password, repassword, email, phone, type } = req.body
    try {
        // 检查用户名是否存在
        const [rows1] = await db.execute('SELECT * FROM user WHERE username = ?', [username])
        if (rows1.length > 0) {
            return res.status(400).json({ message: '用户名已存在' })
        }
        // 检查密码是否一致
        if (password !== repassword) {
            return res.status(400).json({ message: '两次密码不一致' })
        }

        // 注册用户
        const [rows] = await db.execute('INSERT INTO user (username, password,email,phone,user_type) VALUES (?, ?, ?, ?, ?)', [username, password, email, phone, type])
        console.log("注册接口执行：", rows)
        if (rows.affectedRows === 0) {
            return res.status(400).json({ message: '注册失败' })
        }
        res.json({ message: '注册成功', data: rows, status: 200, success: true })
    } catch (err) {
        // 只打印关键错误，不打印完整堆栈（避免刷屏）
        console.error(`注册错误[${new Date().toLocaleTimeString()}]：`, err.message);
    }
})

module.exports = router
