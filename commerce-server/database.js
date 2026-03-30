// 数据库连接配置
const mysql = require('mysql2/promise')
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1597532648Ljh',
    database: 'ecommerce_system'
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