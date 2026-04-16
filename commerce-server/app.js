require('module-alias/register')
//后端入口文件
//定义返回数据格式为
//{
//    success: true,
//    message: 'xxxxx',
//    status: 200,
//    data: {}
//}
const express = require('express')
const app = express()
//挂载登录路由
const loginRouter = require('@/routes/user/login')
const registerRouter = require('@/routes/user/register')
const forgetRouter = require('@/routes/user/forget')
const codeRouter = require('@/routes/user/code')

//挂载管理员路由
const managerRouter = require('@/routes/manager')

const cors = require('cors')
app.use(cors())

// 解析 URL 中的查询参数（?key=value 形式）
app.use(express.urlencoded({ extended: true }));
// 兼容 JSON 格式参数
app.use(express.json());

// 拦截 JSON 解析错误（避免底层堆栈刷屏）
app.use((req, res, next) => {
    const originalJsonParser = express.json({ limit: '1mb' });
    originalJsonParser(req, res, (err) => {
        if (err) {
            console.error(`JSON 解析错误[${new Date().toLocaleTimeString()}]：`, err.message);
            return res.status(400).json({
                success: false,
                message: 'JSON 格式错误（必须用双引号，不能用单引号）'
            });
        }
        next();
    });
});

//挂载登录路由
app.use('/api', loginRouter)
//挂载注册路由
app.use('/api', registerRouter)
//挂载忘记密码路由
app.use('/api', forgetRouter)
//挂载验证码路由
app.use('/api', codeRouter)
//挂载管理员路由
app.use('/api', managerRouter)



//错误处理中间件
app.use((err, req, res, next) => {
    console.error(`全局错误[${new Date().toLocaleTimeString()}]：`, err.message);
    res.status(500).json({ success: false, message: '服务器繁忙，请稍后再试' });
});

// 启动服务
app.listen(8888, () => {
    console.log(`后端服务启动成功，端口：8888`);
});
