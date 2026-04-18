const fs = require('fs');
const path = require('path');
const https = require('https');

// 你数据库里的 12 个商品图片名称和对应的显示文字
const products = [
  { file: 'iPhone 15 Pro.jpg', text: 'iPhone 15 Pro' },
  { file: 'Mate 60 Pro.jpg', text: 'Mate 60 Pro' },
  { file: 'Xiaomi 14 Pro.jpg', text: 'Xiaomi 14 Pro' },
  { file: 'iPad Pro.jpg', text: 'iPad Pro' },
  { file: 'AirPods Pro.jpg', text: 'AirPods Pro' },
  { file: 'Sony WH-CH520.jpg', text: 'Sony WH-CH520' },
  { file: 'JBL Audio.jpg', text: 'JBL Audio' },
  { file: 'Edifier.jpg', text: 'Edifier' },
  { file: 'Watch GT4.jpg', text: 'Watch GT4' },
  { file: 'Mi Band 9.jpg', text: 'Mi Band 9' },
  { file: 'Smart Scale.jpg', text: 'Smart Scale' },
  { file: 'Robot Vacuum.jpg', text: 'Robot Vacuum' }
];

// 确保目录存在
const imgDir = path.join(__dirname, 'public','test');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

console.log('开始下载测试图片...');

products.forEach(item => {
  // 使用 placehold.co 生成带文字的占位图 (淘宝橙色字体 #ff5000)
  const url = `https://placehold.co/400x400/f5f5f5/ff5000.jpg?text=${encodeURIComponent(item.text)}`;
  const filePath = path.join(imgDir, item.file);

  https.get(url, (res) => {
    const fileStream = fs.createWriteStream(filePath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`✅ 成功生成: ${item.file}`);
    });
  }).on('error', (err) => {
    console.error(`❌ 下载失败 ${item.file}:`, err.message);
  });
});