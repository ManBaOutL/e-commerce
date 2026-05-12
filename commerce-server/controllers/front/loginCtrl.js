const db = require('@/config/database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const path = require('path');
const AlipaySdkRaw = require('alipay-sdk');
const AlipaySdk = AlipaySdkRaw.default || AlipaySdkRaw.AlipaySdk || AlipaySdkRaw;

// 1. 获取 alipay-sdk 主文件的绝对路径 (比如 C:\...\dist\commonjs\alipay.js)
const sdkMainPath = require.resolve('alipay-sdk');
// 2. 推导出同一目录下 form.js 的物理绝对路径
const formFilePath = path.join(sdkMainPath, '../form.js');
// 3. 直接通过绝对路径引入，完美绕过拦截！
const FormRaw = require(formFilePath);
const AlipayFormData = FormRaw.default || FormRaw;

// 初始化支付宝 SDK (参数从沙箱控制台获取)
const alipaySdk = new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: process.env.ALIPAY_GATEWAY,
});

const verifyCodeStore = {};

// 登录控制器
exports.login = async (req, res) => {
    console.log("登录请求体: ", req.body)
    const { phone, username, email, password, loginType } = req.body
    let query = '';
    let queryParams = [];

    if (loginType === 'username') {
        query = 'SELECT * FROM user WHERE username = ?';
        queryParams = [username];
    } else if (loginType === 'email') {
        query = 'SELECT * FROM user WHERE email = ?';
        queryParams = [email];
    } else if (loginType === 'phone') {
        query = 'SELECT * FROM user WHERE phone = ?';
        queryParams = [phone];
    } else {
        return res.status(400).json({ message: '登录类型错误', status: 400, success: false })
    }
    console.log("登录query: ", query)
    try {
        // 传入参数数组，彻底杜绝 SQL 注入
        const [rows] = await db.execute(query, queryParams)
        if (rows.length === 0) {
            return res.status(401).json({ message: '用户名不存在', status: 401, success: false })
        }
        // 使用 bcrypt.compareSync 对比密码
        // 前面是前端传来的明文(password)，后面是数据库里查出来的密文(user.password)
        const user = rows[0];
        const isMatch = bcrypt.compareSync(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: '密码错误', status: 401, success: false })
        }
        if (user.status === '禁用') {
            return res.status(403).json({ message: '账号已被封禁，请联系管理员', status: 403, success: false })
        }
        delete user.password;
        // 生成 JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,       // 只存 id！
                username: user.username,
                type: user.type    // 存类型，也可以
            },
            'abcdef123456', // 密钥，随便写，别泄露
            { expiresIn: '7d' } // 7天过期
        )

        const safeUser = {
            user_id: user.user_id,
            username: user.username,
            type: user.type,
            img: user.img,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
        };
        // 返回登录成功响应
        res.json({ message: '登录成功', data: { token, user: safeUser }, status: 200, success: true })
    } catch (err) {
        // 只打印关键错误，不打印完整堆栈（避免刷屏）
        console.error(`登录错误[${new Date().toLocaleTimeString()}]：`, err.message);

        // 按错误类型返回友好提示（不暴露底层细节）
        if (err.message.includes('Table')) {
            res.status(404).json({ success: false, message: '数据库表不存在，请检查表名' });
        } else if (err.message.includes('undefined')) {
            res.status(400).json({ success: false, message: '参数格式错误' });
        } else {
            res.status(500).json({ success: false, message: '服务器内部错误' });
        }
    }
}

// 手机号、邮箱验证码获取
exports.getCode = async (req, res) => {
    console.log(req.body)
    const { phone, email, scene } = req.body;
    const now = Date.now();
    // 发送验证码
    // 处理获取验证码逻辑
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    // 计算过期时间：当前时间 + 1分钟（60*1000 毫秒）
    const expireTime = now + 60 * 1000;

    //判断是手机号还是邮箱
    if (phone) {
        // 存储验证码到内存对象（替代 Redis.set）
        verifyCodeStore[phone] = {
            code: verifyCode,
            expireTime: expireTime,
            sendTime: now // 记录发送时间，用于频率限制
        };
    } else {
        // 存储验证码到内存对象（替代 Redis.set）
        verifyCodeStore[email] = {
            code: verifyCode,
            expireTime: expireTime,
            sendTime: now // 记录发送时间，用于频率限制
        };
    }

    // 返回验证码（开发环境调试用）
    res.json({ status: 200, msg: '验证码已发送', data: verifyCode });
}

// 忘记密码
exports.forget = async (req, res) => {
    console.log("忘记密码请求:", req.body);
    const { phone, email, code, newPwd, repeatPwd, type } = req.body;
    //console.log(verifyCodeStore);
    // 处理重置密码逻辑
    //判断是手机号重置还是邮箱重置
    let storedCode = null;
    if (type === 'phone') {
        storedCode = verifyCodeStore[phone];
    } else if (type === 'email') {
        storedCode = verifyCodeStore[email];
    }
    //console.log("storedCode:", storedCode);
    const now = Date.now();
    //检查是否存在未填
    if ((!phone && !email) || !code || !newPwd || !repeatPwd) {
        console.log("请填写完整信息");
        return res.json({ status: 400, message: '请填写完整信息' });
    }
    // 检查验证码是否过期
    if (now - storedCode.expireTime > 0) {
        //销毁过期验证码
        if (type === 'phone') {
            delete verifyCodeStore[phone];
        } else if (type === 'email') {
            delete verifyCodeStore[email];
        }
        console.log("验证码已过期");
        return res.json({ status: 400, message: '验证码已过期' });
    }
    if (!storedCode.code || storedCode.code !== code) {
        console.log("验证码错误");
        return res.status(400).json({ message: '验证码错误' });
    }
    if (newPwd !== repeatPwd) {
        console.log("两次密码不一致");
        return res.status(400).json({ message: '两次密码不一致' });
    }
    try {
        const allowedTypes = ['phone', 'email'];
        if (!allowedTypes.includes(type)) {
            return res.json({ status: 400, msg: '无效的重置类型' });
        }
        const resetType = type === 'phone' ? 'phone' : 'email';
        const resetData = type === 'phone' ? phone : email;
        // 对新密码进行加密
        const salt = bcrypt.genSaltSync(10);
        const hashedNewPwd = bcrypt.hashSync(newPwd, salt);

        const sql = `UPDATE user SET password = ? WHERE ${resetType} = ?`;

        // 执行数据库更新操作
        const [rows] = await db.execute(sql, [hashedNewPwd, resetData])
        // console.log('调试用完整语句：', `UPDATE user SET password = '${hashedNewPwd}' WHERE ${resetType} = '${resetData}'`);
        if (rows.affectedRows === 0) {
            return res.status(400).json({ message: '忘记密码失败' })
        }
        res.json({ message: '忘记密码成功', data: rows, status: 200, success: true })
        // 重置成功后，销毁验证码
        if (type === 'phone') {
            delete verifyCodeStore[phone];
        } else if (type === 'email') {
            delete verifyCodeStore[email];
        }
    } catch (err) {
        // 只打印关键错误，不打印完整堆栈（避免刷屏）
        console.error(`忘记密码错误[${new Date().toLocaleTimeString()}]：`, err.message);
    }
}

// 注册账户
exports.register = async (req, res) => {
    // console.log("注册请求:", req.body)
    const { username, password, repassword, email, phone, type } = req.body
    try {
        // 检查用户名是否存在
        const [rows1] = await db.execute('SELECT * FROM user WHERE username = ?', [username])
        if (rows1.length > 0) {
            return res.status(400).json({ message: '用户名已存在' })
        }
        // 检查密码是否一致
        if (password !== repassword) {
            return res.status(400).json({ message: '两次密码不一致' })
        }
        // 生成盐并加密密码
        const salt = bcrypt.genSaltSync(10); // 10 是加密强度，默认即可
        const hashedPassword = bcrypt.hashSync(password, salt);
        // 注册用户
        const [rows] = await db.execute('INSERT INTO user (username, password,email,phone,type) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, phone, type])
        console.log("注册接口执行：", rows)
        if (rows.affectedRows === 0) {
            return res.status(400).json({ message: '注册失败' })
        }
        res.json({ message: '注册成功', data: rows, status: 200, success: true })
    } catch (err) {
        // 只打印关键错误，不打印完整堆栈（避免刷屏）
        console.error(`注册错误[${new Date().toLocaleTimeString()}]：`, err.message);
    }
}

exports.verifyCodeStore = verifyCodeStore;

// 支付宝登录控制器
exports.alipayLogin = async (req, res) => {
    const { auth_code } = req.body;
    // console.log("支付宝登录请求体: ", req.body)
    if (!auth_code) {
        return res.status(400).json({ message: '缺少授权码', status: 400, success: false });
    }

    try {
        // 1. 向支付宝换取 access_token
        // 添加一个简单的超时控制和错误捕获
        const tokenResult = await alipaySdk.exec('alipay.system.oauth.token', {
            grantType: 'authorization_code',
            code: auth_code,
        }).catch(err => {
            // 捕获 sdk 内部错误
            console.error("SDK 换取 token 失败:", err);
            throw new Error(err.message.includes('504') ? '支付宝网关超时，请稍后再试' : '获取授权令牌失败');
        });

        const accessToken = tokenResult.accessToken;
        const alipayUserId = tokenResult.userId;

        // 2. 拿着 access_token 去查用户昵称和头像
        // 沙箱环境下，这一步有时候非常容易报错。
        let nickName = `支付宝用户_${alipayUserId.substring(alipayUserId.length - 4)}`;
        let avatar = '';

        try {
            const userInfoResult = await alipaySdk.exec('alipay.user.info.share', {
                auth_token: accessToken,
            });
            if (userInfoResult.nickName) nickName = userInfoResult.nickName;
            if (userInfoResult.avatar) avatar = userInfoResult.avatar;
        } catch (infoErr) {
            console.warn("沙箱获取用户信息失败，使用默认信息。原因:", infoErr.message);
            // 这里不抛出错误，继续走下面的登录/注册流程
        }

        // 3. 在本地数据库查找该用户
        const [rows] = await db.execute('SELECT * FROM user WHERE alipay_user_id = ?', [alipayUserId]);
        let safeUser = null;
        if (rows.length > 0) {
            // 老用户直接登录
            user = rows[0];
            if (user.status === '禁用') {
                return res.status(403).json({ message: '账号已被封禁', status: 403, success: false });
            }

            safeUser = {
                user_id: dbUser.user_id,
                username: dbUser.username,
                type: dbUser.type,
                img: dbUser.img,
                email: dbUser.email,
                phone: dbUser.phone,
                age: dbUser.age,
                gender: dbUser.gender,
            };
        } else {
            // 给第三方登录的用户生成一个占位虚拟密码
            // 使用常规登录时，由于 bcrypt 无法匹配这个明文占位符，所以绝对安全！
            const dummyPassword = 'ALIPAY_QUICK_LOGIN_NO_PASSWORD';

            // 新用户自动注册绑定 (把 password 字段加上去)
            const [insertRes] = await db.execute(
                `INSERT INTO user (username, password, type, img, alipay_user_id, create_time, status) 
                 VALUES (?, ?, '普通用户', ?, ?, NOW(), '正常')`,
                [nickName, dummyPassword, avatar, alipayUserId] // 🌟 按照顺序传入 dummyPassword
            );

            user = {
                user_id: insertRes.insertId,
                username: nickName,
                type: '普通用户',
                img: avatar
            };
        }

        // 🌟 新用户的脱敏对象
        safeUser = {
            user_id: insertRes.insertId,
            username: nickName,
            type: '普通用户',
            img: avatar,
            email: null,
            phone: null,
            age: null,
            gender: '保密',
        };

        // 4. 生成系统 JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, type: user.type },
            'abcdef123456',
            { expiresIn: '7d' }
        );

        res.json({ message: '支付宝登录成功', data: { token, user: safeUser }, status: 200, success: true });

    } catch (err) {
        console.error(`支付宝登录异常[${new Date().toLocaleTimeString()}]：`, err.message);
        // 将友好的错误信息返回给前端
        res.status(500).json({ success: false, message: err.message || '支付宝授权验证失败' });
    }
};

