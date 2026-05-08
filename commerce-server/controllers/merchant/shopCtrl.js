// db = require('@/config/database')
const db = require('@/config/database')
const formatDate = require('@/utils/date').formatIsoDate
const bcrypt = require('bcryptjs')


//处理管理员展示数据的具体逻辑
exports.getShopData = async (req, res) => {
    console.log("商家展示数据请求体: ", req.query)
    // 从请求体中获取商家ID
    const merchant_id = req.user.user_id
    console.log("商家ID: ", merchant_id)
    const [merchantRaw] = await db.query('SELECT user_id, type, username, email, phone, age, gender, create_time, update_time, img, status FROM user WHERE user_id = ?', [merchant_id])
    //获取商店id
    const [shop_idRaw] = await db.query('SELECT * FROM shop WHERE user_id = ?', [merchant_id])
    console.log("商店: ", shop_idRaw[0])


    const showData = {
        merchant: {
            user_id: merchantRaw[0].user_id,
            type: merchantRaw[0].type,
            username: merchantRaw[0].username,
            email: merchantRaw[0].email,
            phone: merchantRaw[0].phone,
            age: merchantRaw[0].age,
            gender: merchantRaw[0].gender,
            create_time: formatDate(merchantRaw[0].create_time, false),
            update_time: formatDate(merchantRaw[0].update_time, false),
            img: merchantRaw[0].img,
            status: merchantRaw[0].status,
        },
        shop: {
            shop_id: shop_idRaw[0].shop_id,
            shop_name: shop_idRaw[0].name,
            description: shop_idRaw[0].description,
            create_time: formatDate(shop_idRaw[0].create_time, false),
        }
    }
    console.log("商家展示数据: ", showData)
    // 返回数据
    res.json({ success: true, message: '获取商家展示数据成功', status: 200, data: showData })
}

exports.updateShopData = async (req, res) => {
    console.log("更新商家展示数据请求体: ", req.body)
    const merchant_id = req.user.user_id
    const { shop, user, password, operation } = req.body
    console.log("更新操作数据: ", operation)
    if (operation === 'shop') {
        await db.query('UPDATE shop SET name = ?, description = ? WHERE user_id = ?', [shop.shop_name, shop.description, merchant_id])
        res.json({ success: true, message: '更新店铺信息成功', status: 200 })
    } else if (operation === 'user') {
        const fs = require('fs');
        const path = require('path');

        // 1. 获取用户ID & 前端传过来的临时头像路径
        const userId = merchant_id;
        let avatarPath = user.img || null;

        // 2. 如果传了新头像（从 temp 来的）
        if (avatarPath && avatarPath.includes('/temp/')) {

            // 目标文件夹：/public/upload/avatars/18
            const targetDir = path.join(__dirname, '../../public/upload/avatars', userId.toString());

            // 文件夹不存在就创建
            if (!fs.existsSync(targetDir)) {
                console.log("创建文件夹: ", targetDir)
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // 获取文件名（如：123.png）
            const fileName = path.basename(avatarPath);

            // 源文件路径（temp里的图片）
            const sourcePath = path.join(__dirname, '../../public', avatarPath);

            // 目标路径
            const targetFilePath = path.join(targetDir, fileName);

            // 移动文件
            fs.renameSync(sourcePath, targetFilePath);

            // 更新为最终存储路径
            avatarPath = `/upload/avatars/${userId}/${fileName}` || '';
        }

        // 3. 存入数据库（把头像路径一起更新）
        await db.query(
            `UPDATE user 
         SET username = ?, email = ?, phone = ?, age = ?, gender = ?, img = ? ,update_time = NOW()
         WHERE user_id = ?`,
            [
                user.username,
                user.email,
                user.phone,
                user.age,
                user.gender,
                avatarPath,
                merchant_id
            ]
        );
        res.json({ success: true, message: '更新用户信息成功', status: 200 })
    } else if (operation === 'password') {
        // 生成盐并加密密码
        const salt = bcrypt.genSaltSync(10); // 10 是加密强度，默认即可
        const hashedPassword = bcrypt.hashSync(password, salt);
        await db.query('UPDATE user SET password = ? WHERE user_id = ?', [hashedPassword, merchant_id])
        res.json({ success: true, message: '更新密码成功', status: 200 })
    } else {
        res.json({ success: false, message: '无效的操作类型', status: 400 })
    }
}