const db = require('@/config/database');
const { operationMap } = require('@/utils/operationMap');
const { urlMap } = require('@/utils/urlMap');

//登录后操作日志记录中间件
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
    const originalSend = res.send;
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