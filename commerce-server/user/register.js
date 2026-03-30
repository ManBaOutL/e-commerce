// 注册路由
const express = require('express')
const router = express.Router()
const db = require('../database')

router.post('/register', async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body
    try {
        const [rows] = await db.execute('INSERT INTO user (username, password) VALUES (?, ?)', [username, password])
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
