const { verifyToken } = require('@/utils/jwt')

// 验证用户登录
exports.checkLogin = (req, res, next) => {
    // console.log('前端传过来的请求头：', req.headers)      // 看这里
    // console.log('authorization：', req.headers.authorization)

    let token = req.headers.authorization || ''
    token = token.replace('Bearer ', '')
    token = token.replace(/^"|"$/g, '')

    const decoded = verifyToken(token)
    // console.log('decoded：', decoded)
    // console.log('token：', token)

    if (!decoded) {
        return res.json({ message: '请先登录', status: 401, success: false })
    }

    // 把解析后的用户信息挂到 req 上，给接口使用
    req.user = decoded
    next()
}

// 验证是否是管理员
exports.checkAdmin = (req, res, next) => {
    this.checkLogin(req, res, () => {
        if (req.user.type !== '管理员') {
            return res.json({ message: '无管理员权限', status: 403, success: false })
        }
        next()
    })
}

// 验证是否是商家
exports.checkMerchant = (req, res, next) => {
    this.checkLogin(req, res, () => {
        if (req.user.type !== '商家') {
            return res.json({ message: '无商家权限', status: 403, success: false })
        }
        next()
    })
}
// 验证是否是用户
exports.checkUser = (req, res, next) => {
    this.checkLogin(req, res, () => {
        if (req.user.type !== '普通用户') {
            return res.json({ message: '无用户权限', status: 403, success: false })
        }
        next()
    })
}