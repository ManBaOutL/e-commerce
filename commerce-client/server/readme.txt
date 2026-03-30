数据mock，使用json-server,运行命令：npm run server


## 接口说明

## 用户相关
POST /api/login → 等价于 POST /users（新增 / 验证用户）；
PUT /api/forget-password → 等价于 PUT /users（修改用户密码）；
POST /api/verify-code/send → 等价于 POST /captchas（新增验证码）；
GET /api/products/1 → 等价于 GET /products/1（获取 id=1 的商品）。

## 商品相关
GET /api/categories → 等价于 GET /categories（获取所有分类）；
GET /api/products → 等价于 GET /products（获取所有商品）；
GET /api/products/1 → 等价于 GET /products/1（获取 id=1 的商品）；
POST /api/products → 等价于 POST /products（新增商品）；