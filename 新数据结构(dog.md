# 数据结构

## **1、用户**

user(<u>user_id</u>,type,username,password,email,phone,age,gender,is_vip,create_time,update_time,img，status);

status:正常、禁用

type:  普通用户、商家、管理员

## 2、商品分类

category(<u>category_id</u>,name,parent_id);

## 3、商品基本信息

product(<u>product_id</u>,name,description,price,stock,create_time,update_time,**category_id,shop_id**,product_status,img，sales, rate);

主要展示商品卡片

img: 对应商品图片文件夹（命名：/upload/products/img/{product_id}/1.jpg/2.png）1图用于卡片展示，后面最多展示3张图（2,3,4）

product_status:待审核，通过，已驳回，下架

sales:销量

## 4、地址基本信息

address(<u>address_id</u>,recipient_name,phone,address,lng,lat,type,province,city,district,street,streetNumber,is_default,create_time,**user_id**)

type: 地址标签（家、公司、学校、其他）

## 5、订单基本信息

order(<u>order_id</u>,total_amount，status,create_time,update_time,**user_id,address_id**，**coupon_id**,refundReason,RejectReason);

coupon_id初始为NULL

status: 9个状态

已取消

待支付->待发货->已发货->已完成->
申请退款->已退款(商家同意)/

​		-> 待审核（商家不同意，管理员） -> 已退款/退款驳回 

### 状态触发时机

- 待支付：在进入支付页面，没有支付直接返回，订单标记为待支付
- 已取消：在订单在待支付状态时，可以主动取消订单
- 待发货/已发货/已完成：忽略发货流程，支付完成订单，订单状态标记为已完成
- 申请退款：在状态在已完成时，普通用户可以选择申请退款（说明退款理由），商家同意可以退款；如果商家不同意（给出拒接理由，交给管理员审核），交给管理员决定：（同意/驳回）

## 6、订单明细

order_details(<u>sku_id,order_id</u>,quantity,price);

## 7、优惠卷

coupon(<u>coupon_id</u>,name,type,discount_value,min_order_amount,start_time,end_time,status,`create_time`,**user_id**);

status: '未使用' | '已使用' | '已过期 | 已创建'

## 8、购物车

cart(<u>cart_id</u>,quantity,create_time,**user_id**,**sku_id**)

## 9、商品评论

comment(<u>review_id</u>,**product_id,user_id,order_id**,rating,comment,create_time,update_time，comment_status，parent_id,images, video, 

is_appended,append_content, append_images, append_video, append_time, append_days )

comment_status:评论状态，正常,待审核，屏蔽，删除（前端用户使用删除评论按钮，后端实行软删除）

parent_id,父评论，用于回复评论

商家回复无rating

append_days: 存储距离首评的天数

images: 评论图片，多张图片有逗号隔开

## 10、活动管理

activity（<u>act_id</u>,name,act_type,goods_type_id,rule,start_time,end_time,act_status,max_discount_value,min_amount，img）

act_type:类型：满减/折扣/秒杀
goods_type_id:适用商品，目前只根据商品类型创建活动
rule:适用的规则，活动介绍
max_discount_value:（折扣（0.9）、秒杀（固定价格）、满减（减除的价格（按比例分摊）））
min_amount:使用的最低价（满减类型时）

act_status: 未开始，已结束，进行中

规定：若一个商品同时又多种优惠活动，秒杀优先，或者满减后若有折扣继续打折

## 11、商品规格sku

sku_product（<u>sku_id</u>, name,act_price,stock,**product_id**,create_time , update_time）

用于计算实际价格

## 12、店铺

shop(<u>shop_id</u>,description,name,create_time,**user_id**)

## 13、日志

log(log_id,username,role,content(操作),log_type(操作类型),create_time,result）

> 操作
>
> ## 1. 登录 / 退出类
>
> - 登录
> - 退出登录
> 
> ## 2. 用户类操作
>
> - 注册账号
>- 修改个人信息
> - 提交订单
> - 支付订单
> - 确认收货
> - 发表评论
> - 回复评论
> - 举报评论
> - 取消订单
> 
> ## 3. 商家类操作
>
> - 创建店铺
>- 修改店铺信息
> - 上架商品
> - 下架商品
> - 编辑商品
> - 删除商品
> - 查看订单
> - 发货
> - 回复评论
> - 查看数据统计
> 
> ## 4. 管理员操作
>
> - 审核店铺
>- 禁用 / 启用店铺
> - 删除违规评论
> - 屏蔽用户
> - 处理举报
> - 商品上下架管理
> - 查看所有订单
> - 日志查看

> type:
>
> **login** —— 登录、退出
>
> **user** —— 用户相关操作
>
> **order** —— 订单操作
>
> **product** —— 商品管理
>
> **shop** —— 店铺管理
>
> **comment** —— 评论、回复、举报
>
> **admin** —— 管理员后台操作
>
> **system** —— 系统操作

## **14、收藏**

favorites(<u>f_id</u>,**user_id**,**sku_id**,create_time)//收藏



# 数据库创建

## 1. 创建表格

> 为了确保外键关联不出错，建表语句必须**按照被依赖的顺序**来执行（例如：先建 `user`，再建 `shop`，再建 `products`）。

```
-- 创建并切换数据库
CREATE DATABASE IF NOT EXISTS `ecommerce_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecommerce_system`;

-- 禁用外键检查（方便重新运行脚本时覆盖数据）
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 用户表 (user)
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(20) NOT NULL COMMENT '用户类型: 普通用户, 商家, 管理员',
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `phone` VARCHAR(20),
  `age` INT,
  `gender` VARCHAR(10) DEFAULT '保密' COMMENT '男, 女, 保密',
  `is_vip` BOOLEAN DEFAULT FALSE,
  `img` VARCHAR(255) COMMENT '头像URL',
  `status` VARCHAR(20) DEFAULT '正常' COMMENT '正常, 禁用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
ALTER TABLE user ADD COLUMN alipay_user_id VARCHAR(100) DEFAULT NULL COMMENT '支付宝用户的唯一标识';
-- 建议加个唯一索引加快查询速度
ALTER TABLE user ADD UNIQUE INDEX idx_alipay_user (alipay_user_id);
ALTER TABLE user ADD COLUMN balance DECIMAL(10, 2) DEFAULT 10000.00 COMMENT '用户余额(元)';
-- 为了方便测试，你可以默认给新用户发1万块钱模拟金

-- ----------------------------
-- 13. 店铺表 (shop) - 依赖user(商家类型)
-- ----------------------------
DROP TABLE IF EXISTS `shop`;
CREATE TABLE `shop` (
  `shop_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `user_id` BIGINT NOT NULL COMMENT '店主ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺表';

-- ----------------------------
-- 2. 商品分类表 (category)
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `category_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID, 0为一级分类'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- ----------------------------
-- 3. 商品基本信息表 (products) - 依赖category, shop
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `product_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL COMMENT '商品基础展示价',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'SPU总库存',
  `img` VARCHAR(1000) COMMENT '主图URL或JSON数组',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `rate` DOUBLE COMMENT '评分',
  `status` VARCHAR(20) DEFAULT '待审核' COMMENT '待审核, 通过, 已驳回, 下架',
  `category_id` BIGINT NOT NULL,
  `shop_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `category`(`category_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shop`(`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表(SPU)';

-- ----------------------------
-- 11. 规格表 (sku_product) - 依赖products
-- ----------------------------
DROP TABLE IF EXISTS `sku_product`;
CREATE TABLE `sku_product` (
  `sku_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT '规格名称, 如: 256GB 原色钛金属',
  `act_price` DECIMAL(10, 2) NOT NULL COMMENT '该规格实际价格',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'SKU库存',
  `product_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格表(SKU)';

-- ----------------------------
-- 4. 地址基本信息表 (address) - 依赖user
-- ----------------------------
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address` (
  `address_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `recipient_name` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `province` VARCHAR(50),
  `city` VARCHAR(50),
  `district` VARCHAR(50),
  `street` VARCHAR(100),
  `streetNumber` VARCHAR(100),
  `address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `lng` DECIMAL(10, 6) COMMENT '经度',
  `lat` DECIMAL(10, 6) COMMENT '纬度',
  `type` VARCHAR(20) COMMENT '如: 家, 公司',
  `is_default` BOOLEAN DEFAULT FALSE,
  `user_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';
-- 地址信息软删除
ALTER TABLE `address` ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '0-正常，1-已删除';

-- ----------------------------
-- 7. 优惠卷表 (coupon) - 依赖user
-- ----------------------------
DROP TABLE IF EXISTS `coupon`;
CREATE TABLE `coupon` (
  `coupon_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(20) NOT NULL COMMENT '满减, 折扣, 无门槛',
  `discount_value` DECIMAL(10, 2) NOT NULL COMMENT '减免金额或折扣率',
  `min_order_amount` DECIMAL(10, 2) DEFAULT 0 COMMENT '起用金额',
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` VARCHAR(20) DEFAULT '未使用' COMMENT '未使用, 已使用, 已过期',
  `user_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- ----------------------------
-- 5. 订单基本信息表 (order) - 依赖user, address, coupon
-- 注意: order是MySQL关键字，使用反引号包裹
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `order_id` VARCHAR(50) PRIMARY KEY COMMENT '非自增，通常使用雪花算法或时间戳生成订单号',
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT '待支付' COMMENT '待支付, 待发货, 已发货, 已完成, 申请退款, 已退款, 已取消',
  `refundReason` VARCHAR(255) COMMENT '退款理由',
  `RejectReason` VARCHAR(255) COMMENT '商家驳回退款理由',
  `user_id` BIGINT NOT NULL,
  `address_id` BIGINT NOT NULL,
  `coupon_id` BIGINT DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
  FOREIGN KEY (`address_id`) REFERENCES `address`(`address_id`),
  FOREIGN KEY (`coupon_id`) REFERENCES `coupon`(`coupon_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- ----------------------------
-- 6. 订单明细表 (order_details) - 依赖order, sku_product
-- ----------------------------
DROP TABLE IF EXISTS `order_details`;
CREATE TABLE `order_details` (
  `order_id` VARCHAR(50) NOT NULL,
  `sku_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL COMMENT '购买时的快照单价',
  PRIMARY KEY (`order_id`, `sku_id`),
  FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`sku_id`) REFERENCES `sku_product`(`sku_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- ----------------------------
-- 8. 购物车表 (cart) - 依赖user, sku_product
-- ----------------------------
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `cart_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `quantity` INT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `sku_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`sku_id`) REFERENCES `sku_product`(`sku_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- ----------------------------
-- 9. 商品评论表 (comment) - 依赖user, products, order
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `review_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `rating` INT COMMENT '评分1-5, 商家回复无评分可为空',
  `comment` TEXT NOT NULL,
  `comment_status` VARCHAR(20) DEFAULT '正常' COMMENT '正常, 待审核, 屏蔽',
  `parent_id` BIGINT DEFAULT NULL COMMENT '父评论ID(用于回复)',
  `product_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `images` varchar(1000) DEFAULT NULL COMMENT '评价图片，多个路径用逗号拼接',
  `video` varchar(255) DEFAULT NULL COMMENT '评价视频，相对路径',
  `is_appended` tinyint DEFAULT '0' COMMENT '是否追评：0:否，1：是',
  `append_content` varchar(1000) DEFAULT NULL,
  `append_images` varchar(255) DEFAULT NULL,
  `append_video` varchar(255) DEFAULT NULL,
  `append_time` datetime DEFAULT NULL,
  `append_days` int DEFAULT '0' COMMENT '距离首评过过了多少天',
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评价表';

-- ----------------------------
-- 10. 活动管理表 (activity)
-- ----------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
  `act_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(20) NOT NULL COMMENT '满减, 折扣, 秒杀',
  `goodsType_id` BIGINT COMMENT '适用的分类ID或商品ID',
  `rule` TEXT COMMENT '活动规则/介绍',
  `value` DECIMAL(10, 2) COMMENT '折扣值(如90表示9折)或减免金额',
  `min` DECIMAL(10, 2) COMMENT '使用门槛(最低价)',
  `img` VARCHAR(255) COMMENT '活动宣传图',
  `status` VARCHAR(20) DEFAULT '进行中' COMMENT '未开始, 进行中, 已结束',
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动管理表';

-- ----------------------------
-- 14. 日志表 (log)
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `log_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `content` VARCHAR(255) NOT NULL COMMENT '具体操作描述',
  `log_type` VARCHAR(50) NOT NULL COMMENT 'login, user, order, product, shop, comment, admin, system',
  `result` VARCHAR(20) DEFAULT '成功' COMMENT '成功, 失败',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统操作日志表';

-- ----------------------------
-- 15. 收藏表 (favorites) - 依赖user, sku_product
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `f_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `spec_id` BIGINT NOT NULL COMMENT '对应 sku_product 的 sku_id',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`spec_id`) REFERENCES `sku_product`(`sku_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;
```

## 2. 初始数据插入

```
-- ----------------------------
-- 插入 1. 用户 (管理员、商家、普通用户、VIP)
-- ----------------------------
INSERT INTO `user` (`user_id`, `type`, `username`, `password`, `email`, `phone`, `age`, `gender`, `is_vip`, `status`) VALUES
(1, '管理员', 'admin', 'e10adc3949ba59abbe56e057f20f883e', 'admin@kk.com', '13800138001', 30, '保密', 1, '正常'),
(2, '商家', 'seller1', 'e10adc3949ba59abbe56e057f20f883e', 'seller1@kk.com', '13800138002', 28, '男', 0, '正常'),
(3, '普通用户', 'user1', 'e10adc3949ba59abbe56e057f20f883e', 'user1@kk.com', '13800138003', 22, '女', 0, '正常'),
(4, '普通用户', 'vip_zhang', 'e10adc3949ba59abbe56e057f20f883e', 'vip@kk.com', '13800138004', 25, '男', 1, '正常'),
(5, '普通用户', 'baduser', 'e10adc3949ba59abbe56e057f20f883e', 'bad@kk.com', '13800138005', 20, '保密', 0, '禁用');

-- ----------------------------
-- 插入 13. 店铺
-- ----------------------------
INSERT INTO `shop` (`shop_id`, `name`, `description`, `status`, `user_id`) VALUES
(1, '优品数码店', '主营数码3C产品，正品保障，假一赔十', '已通过', 2),
(2, '极客外设专营', '高端机械键盘、鼠标、电竞椅', '待审核', 2);

-- ----------------------------
-- 插入 2. 分类 (支持无限极递归)
-- ----------------------------
INSERT INTO `category` (`category_id`, `name`, `parent_id`) VALUES
(1, '手机数码', 0),
(2, '电脑办公', 0),
(3, '耳机音频', 0),
(4, '苹果手机', 1),
(5, '安卓手机', 1),
(6, '无线耳机', 3),
(7, '降噪耳机', 6);

-- ----------------------------
-- 插入 3. 商品 (SPU)
-- ----------------------------
INSERT INTO `products` (`product_id`, `name`, `description`, `price`, `stock`, `img`, `sales`, `status`, `category_id`, `shop_id`) VALUES
(10001, 'iPhone 15 Pro', '苹果最新A17 Pro芯片旗舰手机，钛金属边框', 8999.00, 35, 'img/iphone15pro.jpg', 120, '通过', 4, 1),
(10002, 'AirPods Pro 2', 'H2芯片，主动降噪，自适应通透模式', 1899.00, 100, 'img/airpods.jpg', 560, '通过', 7, 1),
(10003, 'ROG夜魔机械键盘', '客制化无线电竞机械键盘，OLED显示屏', 1799.00, 20, 'img/keyboard.jpg', 45, '待审核', 2, 2);

-- ----------------------------
-- 插入 11. 商品规格 (SKU)
-- ----------------------------
INSERT INTO `sku_product` (`sku_id`, `name`, `act_price`, `stock`, `product_id`) VALUES
(20001, '256GB 原色钛金属', 8999.00, 20, 10001),
(20002, '512GB 原色钛金属', 10999.00, 15, 10001),
(20003, 'Type-C 标准版', 1899.00, 100, 10002),
(20004, '红轴 黑色版', 1799.00, 20, 10003);

-- ----------------------------
-- 插入 4. 收货地址
-- ----------------------------
INSERT INTO `address` (`address_id`, `recipient_name`, `phone`, `province`, `city`, `district`, `address`, `type`, `is_default`, `user_id`) VALUES
(1, '张伟', '13800138004', '北京市', '北京市', '朝阳区', '阳光新城12栋301室', '家', 1, 4),
(2, '李四', '13800138003', '浙江省', '杭州市', '西湖区', '文三路电子信息街99号', '公司', 1, 3);

-- ----------------------------
-- 插入 7. 优惠券
-- ----------------------------
INSERT INTO `coupon` (`coupon_id`, `name`, `type`, `discount_value`, `min_order_amount`, `start_time`, `end_time`, `status`, `user_id`) VALUES
(1, '数码满减券', '满减', 200.00, 10000.00, '2025-01-01 00:00:00', '2026-12-31 23:59:59', '已使用', 4),
(2, '全场9折券', '折扣', 90.00, 100.00, '2026-04-01 00:00:00', '2026-05-01 00:00:00', '未使用', 3),
(3, '新用户无门槛', '无门槛', 50.00, 0.00, '2026-04-01 00:00:00', '2026-04-30 23:59:59', '未使用', 3);

-- ----------------------------
-- 插入 5. 订单
-- ----------------------------
INSERT INTO `order` (`order_id`, `total_amount`, `status`, `user_id`, `address_id`, `coupon_id`, `create_time`) VALUES
('202604070001', 10698.00, '已完成', 4, 1, 1, '2026-04-07 10:30:00'),
('202604070002', 1899.00, '待发货', 3, 2, NULL, '2026-04-08 14:20:00'),
('202604070003', 10999.00, '申请退款', 3, 2, NULL, '2026-04-09 09:15:00');

-- 补全退款订单的理由
UPDATE `order` SET `refundReason` = '商品质量有问题', `RejectReason` = '' WHERE `order_id` = '202604070003';

-- ----------------------------
-- 插入 6. 订单明细
-- ----------------------------
INSERT INTO `order_details` (`order_id`, `sku_id`, `quantity`, `price`) VALUES
('202604070001', 20001, 1, 8999.00), -- 买了一台256G手机
('202604070001', 20003, 1, 1899.00), -- 搭配了一个耳机
('202604070002', 20003, 1, 1899.00),
('202604070003', 20002, 1, 10999.00);

-- ----------------------------
-- 插入 8. 购物车
-- ----------------------------
INSERT INTO `cart` (`cart_id`, `quantity`, `user_id`, `sku_id`) VALUES
(1, 1, 3, 20001),
(2, 2, 4, 20004);

-- ----------------------------
-- 插入 9. 评论
-- ----------------------------
INSERT INTO `comment` (`review_id`, `rating`, `comment`, `comment_status`, `parent_id`, `product_id`, `user_id`, `order_id`) VALUES
(1, 5, '质量很好，物流快，钛金属手感无敌！', '正常', NULL, 10001, 4, '202604070001'),
(2, NULL, '感谢老板支持，祝您生活愉快！', '正常', 1, 10001, 2, '202604070001'),
(3, 1, '包装破损，疑似二手商品。', '屏蔽', NULL, 10001, 5, '202604070001');

-- ----------------------------
-- 插入 10. 活动
-- ----------------------------
INSERT INTO `activity` (`act_id`, `name`, `type`, `goodsType_id`, `rule`, `value`, `min`, `status`, `start_time`, `end_time`) VALUES
(1, '数码节满300减50', '满减', 1, '全场手机数码可用，满300减50', 50.00, 300.00, '进行中', '2026-04-01', '2026-04-15'),
(2, 'AirPods限时秒杀', '秒杀', 10002, '耳机超值秒杀价1499', 400.00, 0.00, '未开始', '2026-04-10', '2026-04-11');

-- ----------------------------
-- 插入 14. 操作日志
-- ----------------------------
INSERT INTO `log` (`log_id`, `username`, `role`, `content`, `log_type`, `result`) VALUES
(1001, 'user1', '普通用户', '修改登录密码', 'user', '成功'),
(1002, 'vip_zhang', 'VIP用户', '提交订单 202604070001', 'order', '成功'),
(1003, 'admin', '管理员', '屏蔽不良评论 (Review ID: 3)', 'comment', '成功'),
(1004, 'seller1', '商家', '上架商品 iPhone 15 Pro', 'product', '成功');

-- ----------------------------
-- 插入 15. 收藏夹
-- ----------------------------
INSERT INTO `favorites` (`f_id`, `user_id`, `spec_id`) VALUES
(1, 3, 20002),
(2, 4, 20004);
```



# 普通用户

## 主页：home/home.vue:

左侧边框：category

右侧登录信息：username

猜你喜欢：productCard : products(name,price,image)

搜索框：？



## 商品详情页：goods/details.vue

详情显示：product(name,price,折后价，销量sales，stock,image（数组）)

​					size(规格，倍数（和price用于算实际价格，也可用于算折扣价）)//规格

商品详情：product（details）

规格参数: size(…)

评论：comment



## 购买界面：buy.vue

收货地址：address(<u>address_id</u>,recipient_name,phone,address_line1,address_line2,city,state,postal_code,country,is_default,create_time,**user_id**)

商品信息：由details.vue传输（name,size,price(单价)，count）

支付方式：暂无



## 我的订单：/user/orders

筛选：order(order_id,create_time,status)

具体订单：

{

order_id,
total_amount,
status,
create_time,

address{recipient_name,phone,line1….},

details{product_id,name,price,quantity},

is_coupon//是否使用优惠券

}

## 去支付：user/orders/pay-order.vue

{ order_id, total_amount, coupon: { discount: 200 }, details: [{ product_name, price }] },address

## 订单详情：user/orders/order-details

order-id,create_time,status

address

order: product-name,size,price,quantity

cupon

{

  **order_id**: 2024001,

  **total_amount**: 10698.0,

  **status**: '已完成',

  **create_time**: '2024-02-10 10:30:00',

  **address**: { recipient_name: '张伟', phone: '13800138002', address_line1: '阳光新城12栋301室', city: '北京市', state: '朝阳区' },

  **coupon**: { name: '满10000减200', discount: 200 },

  **details**: [

   { product_id: 10001, product_name: 'iPhone 15 Pro', price: 8999, quantity: 1, spec: '256GB 原色钛金属' },

   { product_id: 10006, product_name: 'AirPods Pro 2', price: 1899, quantity: 1, spec: '标准版' }

  ]

 },

## 个人资料（普通用户）:user/profile.vue

{

 avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',

 username: 'testuser',

 type: '普通用户',

 email: 'test@demo.com',

 phone: '13800138000',

 age: 25,

 gender: '保密',

 is_vip: false

}

## 我的KK：user/house/index.vue

我的交易：count(order)*4,?,count(cart)

猜你喜欢：[name,image,price,id]

# 管理员：

## 数据概览 manager/showdata

数据概览：count : user,product,order;sum: order

统计图：

xData = ['1日','2日','3日','4日','5日','6日','7日'] //横坐标

 orderData = [15,28,22,35,39,45,42]					//订单总数

saleData = [1500,2800,2200,3500,3900,4500,4200]		//销售额

 pieData = [ { value: , category-name:  }]

## 用户管理：

user

[

​    { user_id: 1, username: 'admin', type: '管理员', phone: '13800138001', status: '正常' },

​    { user_id: 2, username: 'seller1', type: '商家', phone: '13800138002', status: '正常' },

​    { user_id: 3, username: 'user1', type: '普通用户', phone: '13800138003', status: '正常' },

​    { user_id: 4, username: 'vip1', type: 'VIP用户', phone: '13800138004', status: '正常' },

​    { user_id: 5, username: 'baduser', type: '普通用户', phone: '13800138005', status: '禁用' }, // 违规禁用示例

   ]

## 商品管理：

(id,name,price,stock,merchant-id,merchant-name,category-name&id,status(审核状态))

[

{ 

  product_id: 10001, 

  name: 'iPhone 15 Pro', 

  price: 8999, 

  stock: 50, 

  auditStatus: '待审核',

  seller_id: 2,      // 新增商家ID

  seller_name: 'seller1',// 新增商家名称

  category_id: 3,     // 新增分类ID

  category_name: '手机'  // 新增分类名称

 },

]

## 订单管理

(id,user-id,goods,total,create-time,status,userRefundReason退款理由,merchantReason驳回理由)

[

 { orderId: '2026001', userId: '1001', goodsName: '苹果手机', money: '5999', status: '待发货', createTime: '2026-04-01', userRefundReason:'', merchantReason:'' },

]

## 商品分类

（category-id,name,parent-id,parent-name）

[{ category_id: 1, name: '电子产品', parent_id: 0, parent_name: '' }]

## 优惠券管理

（coupon_id,name,type,value,min）

[

 { coupon_id: 1, name: '满500减50', type: '满减', value: 50, min: 500 },

 { coupon_id: 2, name: '9折券', type: '折扣', value: 90, min: 100 },

 { coupon_id: 3, name: '20元无门槛', type: '无门槛', value: 20, min: 0 },

]

## 操作日志管理

（logid,username,role,content(操作),type,create-time,result）

[

 { logId: 1001, username: 'user01', role: '普通用户', content: '修改登录密码', type: '修改密码', time: '2026-04-07 18:20:11', result: '成功' },

 { logId: 1002, username: 'user02', role: 'VIP用户', content: '删除订单评价', type: '删除评价', time: '2026-04-07 17:10:22', result: '成功' },

]

## 活动管理

（actid,name,type,goodsType/name,rule,startTime,endTime,status）

[

 { actId: 1, actName: '满300减50', actType: '满减', goodsName: '无线耳机', rule: '满300减50', startTime: '2026-04-01', endTime: '2026-04-07', status: '进行中' },

 { actId: 2, actName: '耳机限时秒杀', actType: '秒杀', goodsName: '无线耳机', rule: '秒杀价 ¥199', startTime: '2026-04-08', endTime: '2026-04-09', status: '进行中' },

 { actId: 3, actName: '新用户优惠券', actType: '优惠券', goodsName: '机械键盘', rule: '¥50 无门槛', startTime: '2026-04-05', endTime: '2026-04-15', status: '未开始' },

]

## 评论管理

{

  id: 1,

  username: '张三',

  goodsName: 'iPhone 15',

  score: 5,

  content: '非常好，正品',

  createTime: '2025-04-08 10:00',

  status: 'normal',

 }

# 商家

## 数据概览

count: product,order,status=“待发货”,sum:order

// 近7日坐标

const xData = ['1日','2日','3日','4日','5日','6日','7日']

// 订单量折线图

const orderData = [5,12,8,14,18,20,17]

// 销售额柱状图

const saleData = [500,1200,800,1400,1800,2000,1700]

// 饼图：分类成交额

[

 { value: 28600, name: '电子产品' },

 { value: 15400, name: '服装鞋包' },

 { value: 8200, name: '家居用品' },

]

## 商品管理

（product-id,name,price,stock,desc,image,）

(specs)

[

 {

  product_id: 10001,

  name: 'iPhone 15 Pro',

  price: 8999,

  stock: 50,

  desc: '苹果最新旗舰手机',

  img: '#409EFF',

  specs: [

   { name: '黑色 128G', price: '8999', stock: 20 },

   { name: '白色 256G', price: '9999', stock: 15 }

  ]

 }

]

## 订单管理

（orderid,goodsName,money,status,rejectReason）

[

 { 

  orderId: '20260407005', 

  goodsName: '手表', 

  money: '1299', 

  status: '申请退款', 

  refundRejectReason: '', 

  userRefundReason: '商品质量有问题',

  userName: '孙七',

  userPhone: '13500135000',

  createTime: '2026-04-07 14:00:00',

  address: '杭州市西湖区XX路XX号'

 }

]

## 评价管理

[

 { orderId:'ORDER001', username:'小明', goodsName:'iPhone 15 Pro', score:5, content:'质量很好，物流快，服务超棒！', createTime:'2025-04-01 14:30', status: 'normal' }

]

## 店铺信息

const shop = ref({

 name: '优品数码店',

 intro: '主营数码3C产品，正品保障',

 createTime: '2026-04-07',

 status: '已通过'

})

const user = ref({

 name: '张伟',

 email: 'zhangwei@qq.com',

 phone: '13800138002'

})

