// 数据库连接配置
require('dotenv').config();
const mysql = require('mysql2/promise')
const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_system_test',
    charset: process.env.DB_CHARSET || 'utf8',
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