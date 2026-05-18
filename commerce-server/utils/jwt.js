const jwt = require('jsonwebtoken')

// 密钥：优先从环境变量读取，未配置时使用默认值（仅用于开发环境）
const secret = process.env.JWT_SECRET || 'abcdef123456'

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