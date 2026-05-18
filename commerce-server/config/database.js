// 数据库连接配置
const mysql = require('mysql2/promise')
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: process.env.DB_CHARSET || 'utf8mb4',
    timezone: '+08:00', // 设置时区为中国标准时间
})

// 测试连接
async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log('数据库连接成功！');
        connection.release(); // 释放连接
    } catch (err) {
        console.error('数据库连接失败：', err.message);
    }
}

// 初始化时测试连接
testConnection();

module.exports = db