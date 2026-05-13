const db = require('@/config/database');
const { operationMap } = require('@/utils/operationMap');
const { urlMap, loginUrlMap } = require('@/utils/urlMap');

// 专门针对管理员和商户的操作日志中间件
exports.writeLogMiddleware = (req, res, next) => {
    // 1. 从 JWT 获取用户信息
    console.log('日志请求user：', req.user)
    const username = req.user.username;
    const role = req.user.type;

    // 2. 获取请求信息
    //const url = req.path;
    const url = req.baseUrl + req.path;
    console.log('日志请求url：', url)
    const method = req.method.toLowerCase();
    const operation = req.body?.operation || method;
    console.log('日志请求operation：', operation)


    // 3. 匹配 content + operation_type
    let content = '未知操作';
    let operation_type = '系统操作';

    //console.log('日志请求operationMap[url]：', operationMap[url])

    if (operationMap[url] && operationMap[url][operation]) {
        //console.log('日志请求url：', url)
        //console.log('日志请求operation：', operation)
        const logItem = operationMap[url][operation];
        content = logItem.content;
        operation_type = logItem.operation_type;
    }
    //console.log('日志请求content：', content)
    //console.log('日志请求operation_type：', operation_type)

    // 4. 监听返回，操作完成后写入日志
    // 4.1 备份原生 res.send 方法
    const originalSend = res.send;
    // 4.2 篡改原生方法（定义，等待接口返回后再调用）
    res.send = function (body) {
        try {
            const result = typeof body === 'string' ? JSON.parse(body) : body;
            const logResult = result.success === true ? '成功' : '失败';

            // 写入日志（现在带 type 了）
            db.query(
                `INSERT INTO log 
                 (username, role, content, log_type, result) 
                 VALUES (?, ?, ?, ?, ?)`,
                [username, role, content, operation_type, logResult]
            ).catch(err => console.error('日志写入失败：', err));

        } catch (err) {
            console.error('日志处理异常：', err);
        }

        originalSend.call(this, body);
    };

    next();
};

// 专门针对普通用户的操作日志中间件（因为管理员和商户的日志内容和类型可能不太一样）
exports.writeUserLogMiddleware = (req, res, next) => {
    // 1. 从 JWT 获取用户
    const username = req.user?.username || '未知用户';
    const role = req.user?.type || '普通用户';

    // 2. 获取完整真实 URL（自动拼接 /api/xxx）
    const fullUrl = req.baseUrl + req.path;
    const url = fullUrl.toLowerCase(); // 统一小写，避免大小写坑

    console.log('日志请求url：', fullUrl);

    // 3. 直接从 urlMap 匹配（不需要 operation！）
    let content = '未知操作';
    let operation_type = '系统操作';

    if (urlMap[url]) {
        content = urlMap[url].content;
        operation_type = urlMap[url].operation_type;
    }

    // 4. 等待接口返回后再写日志（正确时序）
    const originalSend = res.send;
    res.send = function (body) {
        try {
            // 判断成功/失败
            const result = typeof body === 'string' ? JSON.parse(body) : body;
            const logResult = result.success === true ? '成功' : '失败';

            // 写入数据库
            db.query(
                `INSERT INTO log 
         (username, role, content, log_type, result) 
         VALUES (?, ?, ?, ?, ?)`,
                [username, role, content, operation_type, logResult]
            ).catch(err => console.error('日志写入失败：', err));

        } catch (err) {
            console.error('日志处理异常：', err);
        }

        originalSend.call(this, body);
    };

    next();
};

// 专属的登录/注册授权类操作日志记录中间件
exports.writeAuthLogMiddleware = (req, res, next) => {
    // 1. 获取完整真实 URL 并转小写
    const fullUrl = req.baseUrl + req.path;
    const url = fullUrl.toLowerCase(); 

    console.log('日志请求url：', url)

    // 2. 直接从 urlMap 匹配
    let content = '授权系统访问';
    let operation_type = 'login'; 

    if (loginUrlMap[url]) {
        content = loginUrlMap[url].content;
        operation_type = loginUrlMap[url].operation_type;
    }

    // 3. 拦截响应
    const originalSend = res.send;
    res.send = function (body) {
        try {
            const result = typeof body === 'string' ? JSON.parse(body) : body;
            const logResult = result.success === true ? '成功' : '失败';

            // 🌟 核心黑科技：既然没有 Token，我们就从请求体里“硬抠”身份信息
            // 可能是 username 登录，也可能是 phone/email 登录
            let username = req.body?.username || req.body?.phone || req.body?.email || '匿名访客';
            let role = req.body?.type || '普通用户';

            // 🌟 更进一步：如果登录/注册成功了，后端会在 data.user 里返回真实的数据库信息
            // 此时我们以真实的返回数据为准（防篡改）
            if (result.success && result.data && result.data.user) {
                username = result.data.user.username || username;
                role = result.data.user.type || role;
            }

            // 写入数据库 (log_type 固定为 login)
            db.query(
                `INSERT INTO log (username, role, content, log_type, result) VALUES (?, ?, ?, ?, ?)`,
                [username, role, content, operation_type, logResult]
            ).catch(err => console.error('授权日志写入失败：', err));

        } catch (err) {
            console.error('授权日志处理异常：', err);
        }

        // 放行响应
        originalSend.call(this, body);
    };

    next();
};