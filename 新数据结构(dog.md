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

address(<u>address_id</u>,recipient_name,phone,address,lng,lat,type,province,city,district,street,streetNumber,is_default,create_time,is_deleted,**user_id**)

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

> 为了确保外键关联不出错，建表语句必须**按照被依赖的顺序**来执行（例如：先建 `user`，再建 `shop`，再建 `product`）。

```
-- 创建并切换数据库
CREATE DATABASE IF NOT EXISTS `ecommerce_system_test` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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
ALTER TABLE product DROP CONSTRAINT product_chk_3;
ALTER TABLE product ADD CONSTRAINT product_chk_3 CHECK (product_status IN ('待审核','通过','已驳回','下架','禁用'));

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
-- 3. 商品基本信息表 (product) - 依赖category, shop
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
    `product_id` bigint NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `price` decimal(10, 2) NOT NULL COMMENT '商品基础展示价',
    `stock` int NOT NULL DEFAULT '0' COMMENT 'SPU总库存',
    `img` varchar(1000) DEFAULT NULL COMMENT '主图URL或JSON数组',
    `sales` int DEFAULT '0' COMMENT '销量',
    `product_status` varchar(20) DEFAULT '待审核' COMMENT '待审核, 通过, 已驳回, 下架',
    `category_id` bigint NOT NULL,
    `shop_id` bigint NOT NULL,
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `rate` double unsigned DEFAULT NULL COMMENT '商品评分',
    PRIMARY KEY (`product_id`),
    KEY `category_id` (`category_id`),
    KEY `shop_id` (`shop_id`),
    CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`),
    CONSTRAINT `product_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`shop_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品表(SPU)';

-- ----------------------------
-- 11. 规格表 (sku_product) - 依赖product
-- ----------------------------
DROP TABLE IF EXISTS `sku_product`;
CREATE TABLE `sku_product` (
  `sku_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT '规格名称, 如: 256GB 原色钛金属',
  `act_price` DECIMAL(10, 2) NOT NULL COMMENT '该规格实际价格',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'SKU库存',
  `product_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE
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

ALTER TABLE order_details 
DROP PRIMARY KEY, 
ADD id INT AUTO_INCREMENT PRIMARY KEY FIRST;

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
-- 9. 商品评论表 (comment) - 依赖user, product, order
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
  FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评价表';

-- ----------------------------
-- 10. 活动管理表 (activity)
-- ----------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
    `act_id` bigint NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `act_type` varchar(20) NOT NULL COMMENT '满减, 折扣, 秒杀',
    `goods_type_id` bigint DEFAULT NULL COMMENT '适用的分类ID或商品ID',
    `rule` text COMMENT '活动规则/介绍',
    `max_discount_value` decimal(10, 2) DEFAULT NULL COMMENT '折扣值(如0.9表示9折)或减免金额',
    `min_amount` decimal(10, 2) DEFAULT NULL COMMENT '使用门槛(最低价)',
    `img` varchar(255) DEFAULT NULL COMMENT '活动宣传图',
    `act_status` varchar(20) DEFAULT '进行中' COMMENT '未开始, 进行中, 已结束',
    `start_time` datetime NOT NULL,
    `end_time` datetime NOT NULL,
    PRIMARY KEY (`act_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '活动管理表';
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
    `f_id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL,
    `sku_id` bigint NOT NULL COMMENT '对应 sku_product 的 sku_id',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`f_id`),
    KEY `user_id` (`user_id`),
    KEY `spec_id` (`sku_id`),
    CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`sku_id`) REFERENCES `sku_product` (`sku_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户收藏表';

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;
```

```

-- 创建并切换数据库
CREATE DATABASE IF NOT EXISTS `ecommerce_system_test` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecommerce_system`;

-- 禁用外键检查（避免建表时因为顺序问题或重新运行脚本导致报错）
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
  `alipay_user_id` VARCHAR(100) DEFAULT NULL COMMENT '支付宝用户的唯一标识',
  `balance` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '用户余额(元)',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_alipay_user (`alipay_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 2. 店铺表 (shop) - 依赖 user (商家)
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
-- 3. 商品分类表 (category)
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `category_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID, 0为一级分类'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- ----------------------------
-- 4. 商品基本信息表 (product) - 依赖 category, shop
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
  `product_status` VARCHAR(20) DEFAULT '待审核' COMMENT '待审核, 通过, 已驳回, 下架',
  `category_id` BIGINT NOT NULL,
  `shop_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `category`(`category_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shop`(`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品主表(SPU)';

-- ----------------------------
-- 5. 规格表 (sku_product) - 依赖 product
-- ----------------------------
DROP TABLE IF EXISTS `sku_product`;
CREATE TABLE `sku_product` (
  `sku_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT '规格名称, 如: 256GB 原色钛金属',
  `act_price` DECIMAL(10, 2) NOT NULL COMMENT '该规格实际价格',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'SKU库存',
  `product_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格表(SKU)';

-- ----------------------------
-- 6. 地址基本信息表 (address) - 依赖 user
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
  `lng` DECIMAL(10, 6) COMMENT '高德经度',
  `lat` DECIMAL(10, 6) COMMENT '高德纬度',
  `type` VARCHAR(20) COMMENT '如: 家, 公司',
  `is_default` BOOLEAN DEFAULT FALSE,
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '0-正常，1-已删除(软删除)',
  `user_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- ----------------------------
-- 7. 优惠卷表 (coupon) - 依赖 user
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
-- 8. 订单基本信息表 (order) - 依赖 user, address, coupon
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `order_id` VARCHAR(50) PRIMARY KEY COMMENT '时间戳/雪花算法生成的订单号',
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT '待支付' COMMENT '待支付, 待发货, 已发货, 已完成, 申请退款, 待审核, 已退款, 退款驳回, 已取消',
  `refundReason` VARCHAR(255) COMMENT '退款理由(买家填写)',
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
-- 9. 订单明细表 (order_details) - 依赖 order, sku_product
-- ----------------------------
DROP TABLE IF EXISTS `order_details`;
CREATE TABLE `order_details` (
  `order_id` VARCHAR(50) NOT NULL,
  `sku_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL COMMENT '购买时的快照单价(包含活动分摊)',
  PRIMARY KEY (`order_id`, `sku_id`),
  FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`sku_id`) REFERENCES `sku_product`(`sku_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- ----------------------------
-- 10. 购物车表 (cart) - 依赖 user, sku_product
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
-- 11. 商品评论表 (comment) - 依赖 user, product, order
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `review_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `rating` INT COMMENT '评分1-5, 商家回复无评分可为空',
  `comment` TEXT NOT NULL,
  `comment_status` VARCHAR(20) DEFAULT '正常' COMMENT '正常, 待审核, 屏蔽',
  `parent_id` BIGINT DEFAULT NULL COMMENT '父评论ID(用于商家回复)',
  `product_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `images` VARCHAR(1000) DEFAULT NULL COMMENT '评价图片，多个路径用逗号拼接',
  `video` VARCHAR(255) DEFAULT NULL COMMENT '评价视频，相对路径',
  `is_appended` TINYINT(1) DEFAULT 0 COMMENT '是否有追评：0:否，1:是',
  `append_content` VARCHAR(1000) DEFAULT NULL COMMENT '追评内容',
  `append_images` VARCHAR(255) DEFAULT NULL COMMENT '追评图片',
  `append_video` VARCHAR(255) DEFAULT NULL COMMENT '追评视频',
  `append_time` DATETIME DEFAULT NULL COMMENT '追评时间',
  `append_days` INT DEFAULT 0 COMMENT '距离首评过了多少天',
  FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评价表';

-- ----------------------------
-- 12. 活动管理表 (activity)
-- ----------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
  `act_id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `act_type` VARCHAR(20) NOT NULL COMMENT '满减, 折扣, 秒杀',
  `goods_type_id` BIGINT DEFAULT NULL COMMENT '适用的分类ID或商品ID',
  `rule` TEXT COMMENT '活动规则/介绍',
  `max_discount_value` DECIMAL(10, 2) DEFAULT NULL COMMENT '折扣值(如0.9)或减免金额',
  `min_amount` DECIMAL(10, 2) DEFAULT NULL COMMENT '使用门槛(最低价)',
  `img` VARCHAR(255) DEFAULT NULL COMMENT '活动宣传图',
  `act_status` VARCHAR(20) DEFAULT '进行中' COMMENT '未开始, 进行中, 已结束',
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动管理表';

-- ----------------------------
-- 13. 日志表 (log)
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
-- 14. 收藏表 (favorites) - 依赖 user, sku_product
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `f_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `sku_id` BIGINT NOT NULL COMMENT '对应 sku_product 的 sku_id',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`sku_id`) REFERENCES `sku_product`(`sku_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;
```

#### 初始化数据

```
USE `ecommerce_system_t`;

-- 关闭外键检查，清空旧数据，防止冲突
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `user`;
TRUNCATE TABLE `shop`;
TRUNCATE TABLE `category`;
TRUNCATE TABLE `product`;
TRUNCATE TABLE `sku_product`;
TRUNCATE TABLE `address`;
TRUNCATE TABLE `coupon`;
TRUNCATE TABLE `order`;
TRUNCATE TABLE `order_details`;
TRUNCATE TABLE `cart`;
TRUNCATE TABLE `comment`;
TRUNCATE TABLE `activity`;
TRUNCATE TABLE `log`;
TRUNCATE TABLE `favorites`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. 插入用户数据 (1管理员, 3商家, 5普通用户)
-- ==========================================
INSERT INTO `user` (`user_id`, `type`, `username`, `password`, `email`, `phone`, `age`, `gender`, `is_vip`, `balance`, `status`) VALUES
(1, '管理员', 'admin', 'e10adc3949ba59abbe56e057f20f883e', 'admin@system.com', '13800000000', 35, '男', 1, 999999.00, '正常'),
(2, '商家', 'apple_official', 'e10adc3949ba59abbe56e057f20f883e', 'apple@shop.com', '13800000001', 30, '保密', 1, 50000.00, '正常'),
(3, '商家', 'huawei_official', 'e10adc3949ba59abbe56e057f20f883e', 'huawei@shop.com', '13800000002', 32, '男', 1, 80000.00, '正常'),
(4, '商家', 'mi_official', 'e10adc3949ba59abbe56e057f20f883e', 'mi@shop.com', '13800000003', 28, '女', 0, 15000.00, '正常'),
(5, '普通用户', 'zhangwei', 'e10adc3949ba59abbe56e057f20f883e', 'zhangwei@qq.com', '13900000001', 22, '男', 0, 10000.00, '正常'),
(6, '普通用户', 'liming', 'e10adc3949ba59abbe56e057f20f883e', 'liming@qq.com', '13900000002', 25, '女', 1, 500.00, '正常'),
(7, '普通用户', 'wangfang', 'e10adc3949ba59abbe56e057f20f883e', 'wangfang@qq.com', '13900000003', 24, '女', 1, 2000.00, '正常'),
(8, '普通用户', 'zhaoliu', 'e10adc3949ba59abbe56e057f20f883e', 'zhaoliu@qq.com', '13900000004', 29, '男', 0, 0.00, '正常'),
(9, '普通用户', 'banned_user', 'e10adc3949ba59abbe56e057f20f883e', 'bad@qq.com', '13900000005', 18, '保密', 0, 0.00, '禁用');

-- ==========================================
-- 2. 插入店铺数据
-- ==========================================
INSERT INTO `shop` (`shop_id`, `name`, `description`, `user_id`) VALUES
(1, 'Apple 官方旗舰店', 'Apple 官方授权，正品保障，全场免息', 2),
(2, '华为官方旗舰店', '全场景智慧生活，遥遥领先', 3),
(3, '小米官方旗舰店', '让每个人都能享受科技的乐趣', 4);

-- ==========================================
-- 3. 插入商品分类数据
-- ==========================================
INSERT INTO `category` (`category_id`, `name`, `parent_id`) VALUES
(1, '数码电子', 0),
(2, '家用电器', 0),
(3, '服装鞋包', 0),
(4, '智能手机', 1),
(5, '平板电脑', 1),
(6, '智能穿戴', 1),
(7, '电视', 2);

-- ==========================================
-- 4. 插入商品基础数据 (SPU)
-- ==========================================
INSERT INTO `product` (`product_id`, `name`, `description`, `price`, `stock`, `img`, `sales`, `rate`, `status`, `category_id`, `shop_id`) VALUES
(1001, 'iPhone 15 Pro Max', 'A17 Pro 芯片，全新钛金属机身', 9999.00, 1000, '["/upload/product/img/1001/1.jpg"]', 3500, 4.9, '通过', 4, 1),
(1002, 'iPad Pro 2024', 'M4 芯片，OLED 屏幕，极其轻薄', 8999.00, 500, '["/upload/product/img/1002/1.jpg"]', 1200, 4.8, '通过', 5, 1),
(1003, 'HUAWEI Mate 60 Pro', '未发先售，卫星通话，玄武架构', 6999.00, 800, '["/upload/product/img/1003/1.jpg"]', 5000, 4.9, '通过', 4, 2),
(1004, 'HUAWEI WATCH 4 Pro', '独立微体检，星球设计', 3399.00, 300, '["/upload/product/img/1004/1.jpg"]', 800, 4.7, '通过', 6, 2),
(1005, 'Xiaomi 14 Ultra', '徕卡光学，全明星四摄', 6499.00, 600, '["/upload/product/img/1005/1.jpg"]', 2100, 4.8, '通过', 4, 3),
(1006, 'Redmi 智能电视 86寸', '巨幕影院，4K 超高清', 4999.00, 50, '["/upload/product/img/1006/1.jpg"]', 300, 4.5, '待审核', 7, 3);

-- ==========================================
-- 5. 插入商品规格数据 (SKU)
-- ==========================================
INSERT INTO `sku_product` (`sku_id`, `name`, `act_price`, `stock`, `product_id`) VALUES
(2001, '256GB 原色钛金属', 9999.00, 500, 1001),
(2002, '512GB 原色钛金属', 11999.00, 300, 1001),
(2003, '1TB 白色钛金属', 13999.00, 200, 1001),
(2004, '11英寸 256GB Wi-Fi版', 8999.00, 250, 1002),
(2005, '13英寸 512GB 蜂窝版', 13999.00, 250, 1002),
(2006, '12GB+512GB 雅川青', 6999.00, 400, 1003),
(2007, '12GB+1TB 白沙银', 7999.00, 400, 1003),
(2008, '蔚蓝地球 钛金属表带', 3399.00, 300, 1004),
(2009, '16GB+512GB 黑色素皮', 6499.00, 600, 1005),
(2010, '86寸 标准版', 4999.00, 50, 1006);

-- ==========================================
-- 6. 插入地址数据
-- ==========================================
INSERT INTO `address` (`address_id`, `recipient_name`, `phone`, `province`, `city`, `district`, `street`, `streetNumber`, `address`, `type`, `is_default`, `user_id`) VALUES
(1, '张伟', '13900000001', '广东省', '深圳市', '南山区', '粤海街道', '科技南十二路', '腾讯大厦20层', '公司', 1, 5),
(2, '张伟', '13900000001', '广东省', '广州市', '天河区', '猎德街道', '猎德大道', '猎德花园一期2栋', '家', 0, 5),
(3, '李明', '13900000002', '北京市', '北京市', '海淀区', '上地街道', '西二旗北路', '百度科技园', '公司', 1, 6),
(4, '王芳', '13900000003', '上海市', '上海市', '浦东新区', '张江镇', '祖冲之路', '张江高科技园区', '公司', 1, 7);

-- ==========================================
-- 7. 插入优惠券数据
-- ==========================================
INSERT INTO `coupon` (`coupon_id`, `name`, `type`, `discount_value`, `min_order_amount`, `start_time`, `end_time`, `status`, `user_id`) VALUES
(1, '数码产品满减券', '满减', 500.00, 5000.00, '2024-01-01 00:00:00', '2026-12-31 23:59:59', '未使用', 5),
(2, 'VIP全场9折券', '折扣', 90.00, 0.00, '2024-01-01 00:00:00', '2026-12-31 23:59:59', '未使用', 5),
(3, '新人无门槛神券', '无门槛', 100.00, 0.00, '2024-01-01 00:00:00', '2026-12-31 23:59:59', '已使用', 6),
(4, '过期优惠券', '满减', 200.00, 1000.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', '已过期', 5);

-- ==========================================
-- 8. 插入订单主表
-- ==========================================
INSERT INTO `order` (`order_id`, `total_amount`, `status`, `refundReason`, `RejectReason`, `user_id`, `address_id`, `coupon_id`, `create_time`) VALUES
('202605010001', 9499.00, '已完成', NULL, NULL, 5, 1, 1, '2026-05-01 10:00:00'),
('202605020002', 6899.00, '已发货', NULL, NULL, 6, 3, 3, '2026-05-02 14:30:00'),
('202605030003', 11999.00, '申请退款', '买错了，不想要了', NULL, 5, 2, NULL, '2026-05-03 09:15:00'),
('202605040004', 3399.00, '待审核', '手表颜色发错了', '颜色没发错，拆封不支持无理由', 7, 4, NULL, '2026-05-04 11:00:00'),
('202605050005', 6499.00, '待支付', NULL, NULL, 8, 4, NULL, '2026-05-05 15:20:00'),
('202605060006', 13999.00, '已取消', NULL, NULL, 5, 1, NULL, '2026-05-06 08:00:00');

-- ==========================================
-- 9. 插入订单明细表
-- ==========================================
INSERT INTO `order_details` (`order_id`, `sku_id`, `quantity`, `price`) VALUES
('202605010001', 2001, 1, 9999.00),
('202605020002', 2006, 1, 6999.00),
('202605030003', 2002, 1, 11999.00),
('202605040004', 2008, 1, 3399.00),
('202605050005', 2009, 1, 6499.00),
('202605060006', 2005, 1, 13999.00);

-- ==========================================
-- 10. 插入购物车数据
-- ==========================================
INSERT INTO `cart` (`cart_id`, `quantity`, `user_id`, `sku_id`) VALUES
(1, 2, 5, 2008),
(2, 1, 5, 2004),
(3, 1, 6, 2001);

-- ==========================================
-- 11. 插入商品评论数据 (含首评和追评)
-- ==========================================
INSERT INTO `comment` (`review_id`, `rating`, `comment`, `comment_status`, `product_id`, `user_id`, `order_id`, `is_appended`, `append_content`, `append_days`) VALUES
(1, 5, '钛金属手感绝了，非常轻，系统极其流畅！', '正常', 1001, 5, '202605010001', 1, '用了一周，续航确实比上一代强很多，打游戏也不发烫。', 7),
(2, 4, '遥遥领先！屏幕非常清晰，就是抢不到想要的版本。', '正常', 1003, 6, '202605020002', 0, NULL, 0),
(3, 1, '垃圾东西，坚决退款！', '正常', 1001, 5, '202605030003', 0, NULL, 0),
(4, NULL, '亲爱的顾客您好，很抱歉给您带来不好的体验，请联系客服处理。', '正常', 1001, 2, '202605030003', 0, NULL, 0); -- 商家回复

-- 将第4条设置为第3条的子评论
UPDATE `comment` SET `parent_id` = 3 WHERE `review_id` = 4;

-- ==========================================
-- 12. 插入活动管理数据
-- ==========================================
INSERT INTO `activity` (`act_id`, `name`, `act_type`, `goods_type_id`, `rule`, `max_discount_value`, `min_amount`, `act_status`, `start_time`, `end_time`) VALUES
(1, '数码狂欢节-手机满减', '满减', 4, '买手机满5000减400', 400.00, 5000.00, '进行中', '2026-05-01 00:00:00', '2026-05-31 23:59:59'),
(2, '平板专场打折', '折扣', 5, '平板电脑全场95折', 95.00, 0.00, '进行中', '2026-05-01 00:00:00', '2026-05-15 23:59:59'),
(3, '穿戴设备限时秒杀', '秒杀', 6, '星表秒杀直降500', 2899.00, 0.00, '未开始', '2026-06-01 00:00:00', '2026-06-03 23:59:59');

-- ==========================================
-- 13. 插入日志数据
-- ==========================================
INSERT INTO `log` (`log_id`, `username`, `role`, `content`, `log_type`, `result`, `create_time`) VALUES
(1, 'admin', '管理员', '管理员登录系统', 'login', '成功', '2026-05-01 08:00:00'),
(2, 'apple_official', '商家', '上架了新商品: iPad Pro 2024', 'product', '成功', '2026-05-01 09:00:00'),
(3, 'zhangwei', '普通用户', '成功支付了订单 202605010001', 'order', '成功', '2026-05-01 10:05:00'),
(4, 'zhangwei', '普通用户', '申请取消订单 202605060006', 'order', '成功', '2026-05-06 08:30:00');

-- ==========================================
-- 14. 插入收藏数据
-- ==========================================
INSERT INTO `favorites` (`f_id`, `user_id`, `spec_id`) VALUES
(1, 5, 2004),
(2, 5, 2009),
(3, 6, 2001);
```



# 普通用户

## 主页：home/home.vue:

左侧边框：category

右侧登录信息：username

猜你喜欢：productCard : product(name,price,image)

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

