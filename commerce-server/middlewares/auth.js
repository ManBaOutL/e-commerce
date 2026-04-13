const jwt = require('jsonwebtoken');

// 1. 基础身份验证：检查是否登录 (你原有的代码，保持不变)
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: '未提供访问令牌，请先登录', success: false });
    }
    try {
        const decoded = jwt.verify(token, 'abcdef123456'); 
        req.user = decoded; // 此时 req.user 里包含了 user_id 和 user_type
        next(); 
    } catch (err) {
        return res.status(401).json({ message: '令牌无效或已过期，请重新登录', success: false });
    }
}

// ---------------------------------------------------------
// 下面是新增的角色鉴权中间件
// 注意：使用这些中间件前，必须先经过 verifyToken
// ---------------------------------------------------------

// 2. 商家权限验证
exports.verifyMerchant = (req, res, next) => {
    // 检查经过 verifyToken 解密后的 req.user 中的类型
    if (req.user && req.user.user_type === '商家') {
        next(); // 身份核实完毕，放行
    } else {
        // 403 代表 Forbidden（禁止访问）
        return res.status(403).json({ message: '权限不足：仅限商家访问此接口', success: false });
    }
}

// 3. 管理员权限验证
exports.verifyAdmin = (req, res, next) => {
    // 假设超级管理员也可以访问，可以扩展逻辑
    if (req.user && req.user.user_type === '管理员') {
        next();
    } else {
        return res.status(403).json({ message: '权限不足：仅限系统管理员访问此接口', success: false });
    }
}