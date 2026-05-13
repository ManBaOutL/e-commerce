// ⚠️ 注意：键名（URL路径）已全部转为全小写，以适配拦截器
export const urlMap = {
    // ==========================================
    // 🛒 购物车模块 (/api/user/cart)
    // ==========================================
    "/api/user/cart/add": {
        content: "添加商品至购物车",
        operation_type: "订单管理"
    },
    "/api/user/cart/update": {
        content: "修改购物车商品数量",
        operation_type: "订单管理"
    },
    "/api/user/cart/remove": {
        content: "移出购物车商品",
        operation_type: "订单管理"
    },
    "/api/user/cart/list": {
        content: "查看购物车列表",
        operation_type: "数据查询" // 统一对齐：纯读取接口记为数据查询
    },

    // ==========================================
    // 🧾 订单模块 (/api/user/order)
    // ==========================================
    "/api/user/order/create": {
        content: "提交生成新订单",
        operation_type: "订单管理"
    },
    "/api/user/order/pay": {
        content: "支付订单",
        operation_type: "订单管理"
    },
    "/api/user/order/applyrefund": { 
        content: "申请订单退款",
        operation_type: "订单管理"
    },
    "/api/user/order/cancel": {
        content: "取消订单",
        operation_type: "订单管理"
    },
    "/api/user/order/list": {
        content: "查看我的订单列表",
        operation_type: "数据查询"
    },
    "/api/user/order/checkalipaystatus": { 
        content: "查询支付宝支付状态",
        operation_type: "订单管理"
    },

    // ==========================================
    // 👤 个人资料与资产模块 (/api/user/profile)
    // ==========================================
    "/api/user/profile/update": {
        content: "修改个人信息",
        operation_type: "用户管理"
    },
    "/api/user/profile/recharge": {
        content: "账户余额充值",
        operation_type: "用户管理"
    },
    "/api/user/profile/withdraw": {
        content: "账户余额提现",
        operation_type: "用户管理"
    },
    "/api/user/profile/info": {
        content: "获取个人最新信息",
        operation_type: "数据查询"
    },

    // ==========================================
    // 📍 收货地址模块 (/api/user/address)
    // ==========================================
    "/api/user/address/add": {
        content: "新增收货地址",
        operation_type: "用户管理"
    },
    "/api/user/address/update": {
        content: "修改收货地址",
        operation_type: "用户管理"
    },
    "/api/user/address/delete": {
        content: "删除收货地址",
        operation_type: "用户管理"
    },
    "/api/user/address/setdefault": { 
        content: "设置默认收货地址",
        operation_type: "用户管理"
    },
    "/api/user/address/list": {
        content: "查看收货地址列表",
        operation_type: "数据查询"
    },

    // ==========================================
    // ⭐ 收藏模块 (/api/user/favorite)
    // ==========================================
    "/api/user/favorite/toggle": {
        content: "收藏/取消收藏商品",
        operation_type: "商品管理" // 收藏是对商品的衍生操作
    },
    "/api/user/favorite/remove": {
        content: "移除我的收藏",
        operation_type: "商品管理"
    },
    "/api/user/favorite/list": {
        content: "查看我的收藏列表",
        operation_type: "数据查询"
    },

    // ==========================================
    // 💬 评论模块 (/api/user/comment)
    // ==========================================
    "/api/user/comment/add": {
        content: "发表商品首评",
        operation_type: "评论管理"
    },
    "/api/user/comment/append": {
        content: "追加商品评论",
        operation_type: "评论管理"
    },
    "/api/user/comment/delete": {
        content: "删除商品评论",
        operation_type: "评论管理"
    },
    "/api/user/comment/list": {
        content: "查看我的评论列表",
        operation_type: "数据查询"
    },

    // ==========================================
    // 🎟️ 优惠券与统计 (/api/user/coupons, statistics)
    // ==========================================
    "/api/user/coupons/list": {
        content: "查看我的优惠券",
        operation_type: "数据查询"
    },
    "/api/user/statistics/list": {
        content: "查看个人数据统计",
        operation_type: "数据查询"
    },
    
    // ==========================================
    // 📁 媒体上传 (/api/user/media)
    // ==========================================
    "/api/user/media/upload": {
        content: "上传图片/视频",
        operation_type: "系统操作"
    },

};

export const loginUrlMap = {
    // ==========================================
    // 🔐 登录注册与授权模块 (/api/*)
    // ==========================================
    "/api/login": {
        content: "账号密码登录",
        operation_type: "用户授权" // 登录相关的特殊归类，便于日后排查安全审计
    },
    "/api/alipaylogin": { 
        content: "支付宝快捷登录",
        operation_type: "用户授权"
    },
    "/api/register": {
        content: "注册新账号",
        operation_type: "用户授权"
    },
    "/api/forget": {
        content: "通过验证码重置密码",
        operation_type: "用户授权"
    }
};