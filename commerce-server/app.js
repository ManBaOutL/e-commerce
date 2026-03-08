//后端入口文件
const express = require('express')
const app = express()


//错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || '服务器内部错误',
        success: false
    });
});

// 启动服务
app.listen(8888, () => {
    console.log(`后端服务启动成功，端口：8888`);
});
