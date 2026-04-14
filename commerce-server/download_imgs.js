const fs = require('fs');
const path = require('path');
const https = require('https');

// 你数据库里的 12 个商品图片名称和对应的显示文字
const products = [
  { file: 'iphone15.jpg', text: 'iPhone 15' },
  { file: 'mate60.jpg', text: 'Mate 60 Pro' },
  { file: 'mi14.jpg', text: 'Xiaomi 14' },
  { file: 'ipad.jpg', text: 'iPad' },
  { file: 'airpods.jpg', text: 'AirPods Pro' },
  { file: 'sony.jpg', text: 'Sony WH-CH520' },
  { file: 'jbl.jpg', text: 'JBL Audio' },
  { file: 'edifier.jpg', text: 'Edifier' },
  { file: 'gt4.jpg', text: 'Watch GT4' },
  { file: 'band9.jpg', text: 'Mi Band 9' },
  { file: 'scale.jpg', text: 'Smart Scale' },
  { file: 'robot.jpg', text: 'Robot Vacuum' }
];

// 确保目录存在
const imgDir = path.join(__dirname, 'public','upload', 'img');
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