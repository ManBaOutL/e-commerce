// 请求频率限制中间件
// 使用内存存储访问记录（生产环境建议使用 Redis）

const rateLimitStore = {};
const MAX_REQUESTS = 100; // 最大请求数
const WINDOW_MS = 60000;  // 时间窗口（60秒）

exports.rateLimit = (maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        
        if (!rateLimitStore[clientIP]) {
            rateLimitStore[clientIP] = {
                count: 1,
                startTime: Date.now()
            };
        } else {
            const record = rateLimitStore[clientIP];
            
            // 检查时间窗口是否已过期
            if (Date.now() - record.startTime > windowMs) {
                // 重置计数
                record.count = 1;
                record.startTime = Date.now();
            } else {
                record.count++;
                
                // 检查是否超过限制
                if (record.count > maxRequests) {
                    const remainingTime = Math.ceil((windowMs - (Date.now() - record.startTime)) / 1000);
                    return res.status(429).json({
                        success: false,
                        message: `请求过于频繁，请${remainingTime}秒后重试`,
                        status: 429
                    });
                }
            }
        }
        
        next();
    };
};

// 针对验证码接口的严格限制
exports.strictRateLimit = () => {
    return exports.rateLimit(10, 60000); // 每分钟最多10次请求
};

// 针对登录接口的限制
exports.loginRateLimit = () => {
    return exports.rateLimit(30, 60000); // 每分钟最多30次请求
};