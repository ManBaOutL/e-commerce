export const operationMap = {
    "/api/manager/showData": {
        "get": { content: "获取管理员数据概览", operation_type: "数据查询" }
    },
    "/api/manager/userData": {
        "get": { content: "分页获取用户数据", operation_type: "数据查询" },
        "disable": { content: "禁用用户账号", operation_type: "用户管理" },
        "enable": { content: "启用用户账号", operation_type: "用户管理" },
        "setVip": { content: "设置用户为VIP", operation_type: "用户管理" },
        "cancelVip": { content: "取消用户VIP", operation_type: "用户管理" },
        "delete": { content: "删除用户", operation_type: "用户管理" }
    },
    "/api/manager/allproducts": {
        "get": { content: "分页获取商品数据", operation_type: "数据查询" },
        "pass": { content: "允许上架商品", operation_type: "商品管理" },
        "reject": { content: "驳回上架商品", operation_type: "商品管理" }
    },
    "/api/manager/allorder": {
        "get": { content: "分页获取订单数据", operation_type: "数据查询" },
        "disable": { content: "驳回用户退款申请", operation_type: "订单管理" },
        "enable": { content: "同意用户退款申请", operation_type: "订单管理" }
    },
    "/api/manager/allcategories": {
        "get": { content: "获取分类数据", operation_type: "数据查询" },
        "add": { content: "新增分类", operation_type: "商品管理" },
        "update": { content: "修改分类名", operation_type: "商品管理" },
        "delete": { content: "级联删除分类", operation_type: "商品管理" }
    },
    "/api/manager/allcoupons": {
        "get": { content: "分页获取优惠券数据", operation_type: "数据查询" },
        "create": { content: "创建优惠券", operation_type: "营销管理" },
        "delete": { content: "删除优惠券", operation_type: "营销管理" },
        "toAll": { content: "发放优惠券给所有用户", operation_type: "营销管理" },
        "toUser": { content: "发放优惠券给指定用户", operation_type: "营销管理" },
        "toVip": { content: "发放优惠券给VIP用户", operation_type: "营销管理" }
    },
    "/api/manager/allactivities": {
        "get": { content: "分页获取活动数据", operation_type: "数据查询" },
        "create": { content: "创建活动", operation_type: "营销管理" },
        "delete": { content: "删除活动", operation_type: "营销管理" }
    },
    "/api/manager/allcomments": {
        "get": { content: "分页获取评论数据", operation_type: "数据查询" },
        "delete": { content: "删除违规评论", operation_type: "商品管理" },
        "enable": { content: "审核并启用评论", operation_type: "商品管理" },
        "disable": { content: "审核并禁用评论", operation_type: "商品管理" }
    },
    "/api/manager/alloperationlogs": {
        "get": { content: "分页获取操作日志", operation_type: "数据查询" }
    },
    "/api/merchant/showData": {
        "get": { content: "获取商户数据概览", operation_type: "数据查询" }
    },
    "/api/merchant/comments": {
        "get": { content: "分页获取评论数据", operation_type: "数据查询" },
        "report": { content: "举报评论", operation_type: "评论管理" },
        "reply": { content: "回复评论", operation_type: "评论管理" }
    },
    "/api/merchant/info": {
        "get": { content: "获取商户信息", operation_type: "数据查询" },
        "create": { content: "创建商家初始店铺", operation_type: "店铺管理" }
    },
    "/api/merchant/products": {
        "get": { content: "分页获取商户商品数据", operation_type: "数据查询" },
        "add": { content: "新增商品", operation_type: "商品管理" },
        "edit": { content: "编辑商品信息", operation_type: "商品管理" },
        "delete": { content: "下架商品", operation_type: "商品管理" },
        "pass": { content: "上架商品", operation_type: "商品管理" },
        "stock": { content: "调整商品库存", operation_type: "商品管理" }
    },
    "/api/merchant/shop": {
        "get": { content: "获取商户店铺数据", operation_type: "数据查询" },
        "shop": { content: "修改店铺信息", operation_type: "店铺管理" },
        "user": { content: "修改商户账号", operation_type: "用户管理" },
        "password": { content: "修改商户账号密码", operation_type: "用户管理" }
    }
}

