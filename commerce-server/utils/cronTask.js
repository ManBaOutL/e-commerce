// utils/cronTask.js
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// 🌟 企业标准 3：静默守护进程，清理僵尸文件
const startCleanUpTask = () => {
    // 定时规则：每天凌晨 3:00 执行一次 ('0 3 * * *')
    cron.schedule('0 3 * * *', () => {
        console.log(`[Cron Job] 开始执行临时文件清理任务 - ${new Date().toLocaleString()}`);
        
        const tempDir = path.join(process.cwd(), 'public', 'upload', 'temp');
        
        if (!fs.existsSync(tempDir)) return;

        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        let deletedCount = 0;

        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            
            // 检查文件最后修改时间，如果距离现在超过 24 小时，说明它是被抛弃的垃圾
            if (now - stats.mtimeMs > TWENTY_FOUR_HOURS) {
                fs.unlinkSync(filePath); // 物理删除
                deletedCount++;
            }
        });

        console.log(`[Cron Job] 清理完成！共删除了 ${deletedCount} 个过期临时文件。`);
    });
};

module.exports = { startCleanUpTask };