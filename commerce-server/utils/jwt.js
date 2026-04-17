const jwt = require('jsonwebtoken')

// 密钥
const secret = 'abcdef123456'

// 生成 Token
exports.createToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            user_type: user.user_type
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