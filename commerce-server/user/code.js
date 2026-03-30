// 验证码相关
const express = require('express')
const router = express.Router()
const db = require('../database')

const verifyCodeStore = {};

router.post('/code', async (req, res) => {
    console.log(req.body)
    const { phone, email, scene } = req.body;
    const now = Date.now();
    // 发送验证码
    // 处理获取验证码逻辑
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    // 计算过期时间：当前时间 + 1分钟（60*1000 毫秒）
    const expireTime = now + 60 * 1000;

    //判断是手机号还是邮箱
    if (phone) {
        // 存储验证码到内存对象（替代 Redis.set）
        verifyCodeStore[phone] = {
            code: verifyCode,
            expireTime: expireTime,
            sendTime: now // 记录发送时间，用于频率限制
        };
    } else {
        // 存储验证码到内存对象（替代 Redis.set）
        verifyCodeStore[email] = {
            code: verifyCode,
            expireTime: expireTime,
            sendTime: now // 记录发送时间，用于频率限制
        };
    }


    // 返回验证码（开发环境调试用）
    res.json({ status: 200, msg: '验证码已发送', data: verifyCode });
})

module.exports = router

//导出verifyCodeStore
module.exports.verifyCodeStore = verifyCodeStore;