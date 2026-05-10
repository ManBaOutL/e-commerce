require('module-alias/register')
const { startCleanUpTask } = require('./utils/cronTask');

//后端入口文件
//定义返回数据格式为
//{
//    success: true,
//    message: 'xxxxx',
//    status: 200,
//    data: {}
//}
require('dotenv').config();
const express = require('express')
const app = express()
const path = require('path');
// 托管 public 文件夹
app.use(express.static(path.join(__dirname, 'public')));
//挂载登录路由
const loginRouter = require('@/routes/front')
// 挂载用户路由
const userRouter = require('@/routes/user')
//挂载管理员路由
const managerRouter = require('@/routes/manager')
//挂载商家路由
const merchantRouter = require('@/routes/merchant')


const cors = require('cors')
app.use(cors())

// 启动定时任务
startCleanUpTask();

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
// 挂载用户路由
app.use('/api', userRouter)
//挂载管理员路由
app.use('/api', managerRouter)
//挂载商家路由
app.use('/api', merchantRouter)



//错误处理中间件
app.use((err, req, res, next) => {
    console.error(`全局错误[${new Date().toLocaleTimeString()}]：`, err.message);
    res.status(500).json({ success: false, message: '服务器繁忙，请稍后再试' });
});

// 启动服务
app.listen(8888, () => {
    console.log(`后端服务启动成功，端口：8888`);
});
