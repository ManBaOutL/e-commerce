# *电子商务系统开发需求说明文档*

**开发技术栈**：前端 Vue、后端 Node.js

**开发小组**：黄钰坤(2023211049)、刘俊宏(2023211058)

## 一、开发工具与平台

### 前端

核心框架：Vue 3；辅助工具：Vue Router、Pinia、Excel/PDF 导出插件、地图 API；开发工具：VS Code。

构建工具： vite

### 后端

运行环境：Node.js；数据库：MySQL；辅助工具：JWT、密码加密插件、日志插件、跨域处理插件；开发工具：VS Code。

### 其他

接口测试：Postman；版本控制：Git/GitHub。

## 二、核心开发功能

### （一）普通用户

1. 用户管理：支持邮箱 / 手机号 + 验证码注册、账号密码 / 微信支付宝第三方登录、密码找回。
2. 可修改个人信息、绑定 / 解绑账号并完成短信验证。
3. 商品浏览与购买：支持商品关键词搜索、多条件筛选与多规则排序，查看商品详情及评分等功能。
4. 购物车支持商品增删改量，自动计算总价、优惠和运费，标记库存异常 / 下架商品。
5. 查看全状态订单，可取消未支付订单、对已完成订单图文评价，未支付订单超时自动取消。

### （二）管理员

1. 用户管理：查看用户核心信息，分配普通 / VIP 角色、禁用违规账号，记录用户敏感操作日志。
2. 商品管理：实现商品多级分类管理，增删改商品信息，创建满减、秒杀、优惠券活动并绑定指定商品。
3. 订单管理：多条件筛选订单，审核退货申请、确认退款金额，手动标记订单发货。
4. 数据统计与分析：查看实时销售数据、热销商品 Top10，分析地域 / 年龄段消费偏好；自动生成多周期报表并支持导出，自定义数据可视化看板。
5. 优惠券管理：创建各类优惠券，向指定用户发放优惠券。

### （三）商家

1. 店铺管理：可设置店铺名称、头像、简介等基础信息，修改店铺登录密码，查看店铺入驻信息与审核状态。
2. 商品管理：增删改本店商品信息，实时修改商品库存、价格，上下架商品；查看本店商品分类。
3. 订单管理：查看本店所有订单，审核本店订单的退换货申请并提交退款确认，查看本店订单的物流与售后记录。
4. 数据统计：查看本店实时销售额、订单量、客单价，统计本店热销商品排行；查看店铺经营数据，图表展示经营趋势，支持导出店铺经营明细报表。
6. 评价管理：查看本店商品的用户评价与评分，可对用户评价进行回复，处理用户的追评。

## 三、数据设计内容

### （一）核心数据实体

新增**商家店铺**数据实体，保留原有用户、商品分类、商品、收货地址、订单、购物车、优惠券、商品评价八大核心实体；各实体核心字段完整，字段间关联逻辑清晰，其中商家店铺实体包含店铺 ID、商家 ID、店铺名称、店铺简介、入驻时间、审核状态等核心字段。

用户

user(<u>user_id</u>,type,username,password,email,phone,age,gender,is_vip,create_time,update_time);

商品分类

category(<u>category_id</u>,name,parent_id);

商品基本信息

products(<u>product_id</u>,name,description,price,stock,category_id,create_time,update_time,**category_id,user_id**)

地址基本信息

address(<u>address_id</u>,recipient_name,phone,address_line1,address_line2,city,state,postal_code,country,is_default,create_time,**user_id**)

订单基本信息

order(<u>order_id</u>,total_amount,status,create_time,update_time,**user_id,address_id**);

订单明细

order_details(<u>product_id,order_id</u>,quantity,price);

优惠卷

coupon(<u>coupon_id</u>,type,discount_value,min_order_amount,start_time,end_time,status,create_time,update_time,**user_id**);

购物车

cart(<u>cart_id</u>,**product_id**,quantity,create_time,**user_id**)

商品评论

comment(<u>review_id</u>,**product_id,user_id,order_id**,rating,comment,create_time,update_time)



## 四、数据库创建流程

### 1. 创建数据库

```
CREATE DATABASE IF NOT EXISTS ecommerce_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ecommerce_system;
```

### 2. 创建数据表

#### 2.1 用户表 (user)

```
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('普通用户', '管理员', '商家') DEFAULT '普通用户',
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    age INT,
    gender ENUM('男', '女', '保密') DEFAULT '保密',
    is_vip BOOLEAN DEFAULT FALSE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;
```

#### 2.2 商品分类表 (category)

```
CREATE TABLE category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES category(category_id) ON DELETE CASCADE
) ;
```

#### 2.3 商品基本信息表 (products)

```
    CREATE TABLE products (
        product_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        category_id INT,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL
    ) ;
```

#### 2.4 地址基本信息表 (address)

```
CREATE TABLE address (
    address_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipient_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT '中国',
    is_default BOOLEAN DEFAULT FALSE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);
```

#### 2.5 订单基本信息表 (order)

```
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('待支付', '已支付', '已发货', '已完成', '已取消') DEFAULT '待支付',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (address_id) REFERENCES address(address_id) ON DELETE SET NULL
) ;
```

#### 2.6 订单明细表 (order_details)

```
CREATE TABLE order_details (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
) ;
```

#### 2.7 优惠券表 (coupon)

```
CREATE TABLE coupon (
    coupon_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    type ENUM('满减', '折扣', '固定金额') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('未使用', '已使用', '已过期') DEFAULT '未使用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
) ;
```

#### 2.8 购物车表 (cart)

```
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
) ;
```

#### 2.9 商品评论表 (comment)

```
CREATE TABLE comment (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ;
```

## 二、补充说明

### 1. 字段类型说明

- `DECIMAL(10,2)`：用于金额字段，保留两位小数
- `TINYINT`：用于评分等小范围整数
- `ENUM`：用于固定选项的字段
- `DATETIME`：使用MySQL的日期时间类型

### 2. 索引优化

- 为经常查询的字段添加索引
- 为外键字段自动添加索引
- 使用复合索引优化多条件查询

### 3. 外键约束

- `ON DELETE CASCADE`：级联删除
- `ON DELETE SET NULL`：删除时设为NULL
- `ON DELETE RESTRICT`：限制删除

### 4. 字符集选择

- 使用`utf8mb4`支持emoji和所有Unicode字符

## 五、后续开发建议

1. **数据迁移工具**：可以使用 Sequelize 或 TypeORM 进行数据库迁移管理
2. **数据备份**：定期使用 mysqldump 备份数据库
3. **性能优化**：根据实际查询情况添加适当的索引
4. **分表策略**：订单表等大数据量表可考虑按时间分表

## 电商系统测试数据

以下是可直接导入MySQL的测试数据，按照表依赖关系排序：

### 1. 用户表数据 (user)

```
-- 用户表测试数据
INSERT INTO user (user_id, type, username, password, email, phone, age, gender, is_vip, create_time) VALUES
(1, '管理员', 'admin', '$2a$10$X7VYx/h1K3X9K8Z7Q5R2Uu6W1q2r3t4y5u6i7o8p9a0s1d2f3g4h5j6k', 'admin@eshop.com', '13800138001', 30, '男', TRUE, '2024-01-01 10:00:00'),
(2, '商家', 'zhang_wei', '$2a$10$X7VYx/h1K3X9K8Z7Q5R2Uu6W1q2r3t4y5u6i7o8p9a0s1d2f3g4h5j6k', 'zhangwei@email.com', '13800138002', 28, '男', TRUE, '2024-01-02 14:30:00'),
(3, '普通用户', 'li_na', '$2a$10$X7VYx/h1K3X9K8Z7Q5R2Uu6W1q2r3t4y5u6i7o8p9a0s1d2f3g4h5j6k', 'lina@email.com', '13800138003', 25, '女', FALSE, '2024-01-03 09:15:00'),
(4, '商家', 'wang_ming', '$2a$10$X7VYx/h1K3X9K8Z7Q5R2Uu6W1q2r3t4y5u6i7o8p9a0s1d2f3g4h5j6k', 'wangming@email.com', '13800138004', 32, '男', TRUE, '2024-01-05 16:20:00'),
(5, '普通用户', 'chen_jie', '$2a$10$X7VYx/h1K3X9K8Z7Q5R2Uu6W1q2r3t4y5u6i7o8p9a0s1d2f3g4h5j6k', 'chenjie@email.com', '13800138005', 22, '女', FALSE, '2024-01-10 11:45:00'),
(6, '普通用户', 'liu_yang', '$2a$10$X7VYx/h1K3X9K8Z7Q5R2Uu6W1q2r3t4y5u6i7o8p9a0s1d2f3g4h5j6k', 'liuyang@email.com', '13800138006', 29, '男', FALSE, '2024-01-15 13:10:00'),
(7, '商家', 'zhao_li', '$2a$10$X7VYx/h1K3X9K8Z7Q5R2Uu6W1q2r3t4y5u6i7o8p9a0s1d2f3g4h5j6k', 'zhaoli@email.com', '13800138007', 35, '女', TRUE, '2024-02-01 10:30:00');
```

### 2. 商品分类表数据 (category)

```
-- 商品分类测试数据（多级分类）
INSERT INTO category (category_id, name, parent_id) VALUES
-- 一级分类
(1, '电子产品', NULL),
(2, '服装鞋包', NULL),
(3, '食品饮料', NULL),
(4, '家居用品', NULL),
(5, '图书文具', NULL),

-- 电子产品子分类
(101, '手机', 1),
(102, '电脑', 1),
(103, '耳机', 1),
(104, '智能手表', 1),

-- 服装鞋包子分类
(201, '男装', 2),
(202, '女装', 2),
(203, '运动鞋', 2),
(204, '箱包', 2),

-- 食品饮料子分类
(301, '休闲零食', 3),
(302, '饮料', 3),
(303, '生鲜水果', 3),

-- 三级分类示例
(1001, '苹果手机', 101),
(1002, '华为手机', 101),
(1003, '小米手机', 101),
(1004, '游戏本', 102),
(1005, '轻薄本', 102);
```

### 3. 商品基本信息表数据 (products)

```
-- 商品测试数据
INSERT INTO products (product_id, name, description, price, stock, category_id, create_time) VALUES
-- 手机类
(10001, 'iPhone 15 Pro', '苹果最新旗舰手机，A17 Pro芯片，钛金属边框', 8999.00, 50, 1001, '2024-02-01 09:00:00'),
(10002, '华为 Mate 60 Pro', '鸿蒙系统，卫星通信，昆仑玻璃', 6999.00, 30, 1002, '2024-02-01 09:00:00'),
(10003, '小米 14 Ultra', '徕卡四摄，骁龙8 Gen3', 5999.00, 45, 1003, '2024-02-01 09:00:00'),

-- 电脑类
(10004, 'MacBook Pro 14', 'M3芯片，16GB内存，512GB SSD', 14999.00, 20, 1004, '2024-02-02 10:00:00'),
(10005, '联想 ThinkPad X1', 'Intel i7，32GB内存，1TB SSD', 12999.00, 15, 1005, '2024-02-02 10:00:00'),

-- 耳机类
(10006, 'AirPods Pro 2', '主动降噪，空间音频', 1899.00, 100, 103, '2024-02-03 11:00:00'),
(10007, '华为 FreeBuds Pro 3', '智慧动态降噪，超强续航', 1499.00, 80, 103, '2024-02-03 11:00:00'),

-- 服装类
(10008, '男士休闲夹克', '纯棉材质，春秋款', 399.00, 200, 201, '2024-02-04 14:00:00'),
(10009, '女士针织衫', '羊毛混纺，温柔气质', 299.00, 150, 202, '2024-02-04 14:00:00'),
(10010, '运动跑鞋', '轻便透气，减震防滑', 459.00, 120, 203, '2024-02-05 09:30:00'),

-- 食品类
(10011, '进口巧克力礼盒', '多种口味，精美包装', 199.00, 300, 301, '2024-02-06 10:15:00'),
(10012, '坚果大礼包', '每日坚果，健康零食', 159.00, 250, 301, '2024-02-06 10:15:00'),
(10013, '进口车厘子', 'JJ级，新鲜空运', 299.00, 100, 303, '2024-02-07 13:20:00'),

-- 图书类
(10014, 'Python编程从入门到实践', '编程入门经典教材', 89.00, 500, 5, '2024-02-08 15:40:00'),
(10015, '三体全集', '刘慈欣科幻巨著', 128.00, 400, 5, '2024-02-08 15:40:00');
```

### 4. 地址基本信息表数据 (address)

```
-- 地址测试数据
INSERT INTO address (address_id, user_id, recipient_name, phone, address_line1, address_line2, city, state, postal_code, is_default, create_time) VALUES
(1, 2, '张伟', '13800138002', '阳光新城12栋301室', NULL, '北京市', '朝阳区', '100020', TRUE, '2024-01-05 10:00:00'),
(2, 2, '张伟', '13800138002', '科技园区B座502室', '公司地址', '北京市', '海淀区', '100080', FALSE, '2024-01-05 10:00:00'),
(3, 3, '李娜', '13800138003', '锦绣花园5栋202室', NULL, '上海市', '浦东新区', '200120', TRUE, '2024-01-06 14:30:00'),
(4, 4, '王明', '13800138004', '翠竹苑8栋1501室', NULL, '广州市', '天河区', '510630', TRUE, '2024-01-08 09:45:00'),
(5, 5, '陈洁', '13800138005', '书香门第3栋101室', NULL, '深圳市', '南山区', '518057', TRUE, '2024-01-12 16:20:00'),
(6, 6, '刘洋', '13800138006', '碧水湾21栋602室', NULL, '杭州市', '西湖区', '310013', TRUE, '2024-01-18 11:10:00'),
(7, 7, '赵丽', '13800138007', '翡翠城15栋203室', NULL, '成都市', '高新区', '610041', TRUE, '2024-02-05 13:15:00');
```

### 5. 订单基本信息表数据 (orders)

```
-- 订单测试数据
INSERT INTO orders (order_id, user_id, address_id, total_amount, status, create_time) VALUES
-- 已完成订单
(2024001, 2, 1, 10898.00, '已完成', '2024-02-10 10:30:00'),
(2024002, 3, 3, 458.00, '已完成', '2024-02-12 14:20:00'),
(2024003, 4, 4, 7198.00, '已完成', '2024-02-15 09:15:00'),

-- 待支付订单
(2024004, 5, 5, 299.00, '待支付', '2024-03-01 11:40:00'),
(2024005, 6, 6, 1899.00, '待支付', '2024-03-01 15:30:00'),

-- 已发货订单
(2024006, 2, 1, 399.00, '已发货', '2024-02-28 16:45:00'),
(2024007, 7, 7, 458.00, '已发货', '2024-02-29 10:10:00'),

-- 已取消订单
(2024008, 3, 3, 159.00, '已取消', '2024-02-20 13:25:00');
```

### 6. 订单明细表数据 (order_details)

```
-- 订单明细测试数据
INSERT INTO order_details (order_id, product_id, quantity, price) VALUES
-- 订单2024001：iPhone 15 Pro + 保护壳
(2024001, 10001, 1, 8999.00),
(2024001, 10006, 1, 1899.00),

-- 订单2024002：运动鞋
(2024002, 10010, 1, 458.00),

-- 订单2024003：华为手机 + 耳机
(2024003, 10002, 1, 6999.00),
(2024003, 10007, 1, 1499.00),

-- 订单2024004：女装
(2024004, 10009, 1, 299.00),

-- 订单2024005：AirPods
(2024005, 10006, 1, 1899.00),

-- 订单2024006：夹克
(2024006, 10008, 1, 399.00),

-- 订单2024007：跑鞋
(2024007, 10010, 1, 458.00),

-- 订单2024008：坚果
(2024008, 10012, 1, 159.00);
```

### 7. 优惠券表数据 (coupon)

```
-- 优惠券测试数据
INSERT INTO coupon (coupon_id, user_id, type, discount_value, min_order_amount, start_time, end_time, status, create_time) VALUES
(1, 2, '满减', 50.00, 500.00, '2024-02-01 00:00:00', '2024-03-01 23:59:59', '已使用', '2024-02-01 09:00:00'),
(2, 2, '折扣', 0.85, 1000.00, '2024-03-01 00:00:00', '2024-04-01 23:59:59', '未使用', '2024-03-01 10:00:00'),
(3, 3, '固定金额', 20.00, 100.00, '2024-02-01 00:00:00', '2024-03-01 23:59:59', '已过期', '2024-02-01 09:00:00'),
(4, 4, '满减', 100.00, 1000.00, '2024-02-15 00:00:00', '2024-03-15 23:59:59', '未使用', '2024-02-15 10:00:00'),
(5, 5, '折扣', 0.90, 500.00, '2024-03-01 00:00:00', '2024-03-31 23:59:59', '未使用', '2024-03-01 09:00:00'),
(6, 6, '满减', 30.00, 200.00, '2024-02-20 00:00:00', '2024-03-20 23:59:59', '未使用', '2024-02-20 11:00:00'),
(7, NULL, '满减', 20.00, 100.00, '2024-03-01 00:00:00', '2024-04-01 23:59:59', '未使用', '2024-03-01 10:30:00');
```

### 8. 购物车表数据 (cart)

```
-- 购物车测试数据
INSERT INTO cart (cart_id, user_id, product_id, quantity, create_time) VALUES
(1, 2, 10005, 1, '2024-03-01 14:30:00'),
(2, 3, 10013, 2, '2024-03-01 15:20:00'),
(3, 4, 10011, 1, '2024-03-01 16:45:00'),
(4, 5, 10008, 2, '2024-03-02 09:10:00'),
(5, 6, 10014, 1, '2024-03-02 10:30:00'),
(6, 2, 10010, 1, '2024-03-02 11:15:00'),
(7, 7, 10003, 1, '2024-03-02 13:40:00');
```

### 9. 商品评论表数据 (comment)

```
-- 商品评论测试数据
INSERT INTO comment (review_id, product_id, user_id, order_id, rating, comment, create_time) VALUES
-- iPhone 15 Pro 评论
(1, 10001, 2, 2024001, 5, '手机非常好用，拍照效果很棒，系统流畅', '2024-02-15 10:30:00'),
(2, 10001, 2, 2024001, 5, '用了两周了，续航给力，颜色也很漂亮', '2024-02-18 14:20:00'),

-- 华为手机评论
(3, 10002, 4, 2024003, 5, '信号很好，电池耐用，支持国货', '2024-02-20 09:15:00'),

-- 运动鞋评论
(4, 10010, 3, 2024002, 4, '鞋子很舒服，就是尺码偏小，建议买大一码', '2024-02-16 16:40:00'),
(5, 10010, 7, 2024007, 5, '跑步很轻便，减震效果好', '2024-03-01 19:30:00'),

-- AirPods评论
(6, 10006, 2, 2024001, 5, '降噪效果很好，连接稳定', '2024-02-15 11:20:00'),

-- 女装评论
(7, 10009, 5, 2024004, 4, '衣服质量不错，就是发货有点慢', '2024-02-25 13:10:00'),

-- 坚果评论
(8, 10012, 3, 2024008, 3, '味道还可以，但是物流太慢了', '2024-02-22 15:30:00'),

-- 夹克评论
(9, 10008, 2, 2024006, 4, '款式不错，面料舒适', '2024-03-01 10:45:00');
```

## 导入说明

### 导入顺序（按依赖关系）

1. user.sql
2. category.sql
3. products.sql
4. address.sql
5. order.sql
6. order_details.sql
7. coupon.sql
8. cart.sql
9. comment.sql

### 导入命令

```
# 命令行导入
mysql -u 用户名 -p 数据库名 < 文件名.sql

# 或在MySQL客户端中
SOURCE /path/to/file.sql;
```

这些测试数据涵盖了电商系统的主要业务场景，包含：

- 多级商品分类
- 不同状态的订单
- 完整的用户信息
- 商品评价
- 购物车数据
- 优惠券信息



