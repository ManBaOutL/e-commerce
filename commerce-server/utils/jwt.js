require('dotenv').config();
const jwt = require('jsonwebtoken')

// 密钥 - 从环境变量读取
const secret = process.env.JWT_SECRET || 'default_fallback_secret_should_not_be_used_in_production'

// 生成 Token
exports.createToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            username: user.username,
            type: user.type
        },
        secret,
        { expiresIn: '7d' }
    )
}

// 验证 Token
exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, secret)
    } catch (e) {
        return null
    }
}