// 管理员相关接口类型定义
// export interface Manager {
//     username: string
//     type: string
// }

export interface pagination {
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
}

export interface showCondition {
    day?: number // 最近几天的数据，默认为7天
}

// 管理员展示数据类型定义
export interface managerShowData {
    //总体数据
    totalUserCount: number
    totalProductCount: number
    totalOrderCount: number
    sumOrderAmount: number
    // 图表数据
    xData: string[]
    orderData: number[]
    saleData: number[]
    pieData: { categoryName: string, value: number }[]
}

// 管理员用户列表查询条件类型定义
export interface userCondition {
    username?: string
    type?: string
    status?: string
}
// 用户操作
export interface userOperation {
    user_id: number[]
    operation: string
}

// 管理员用户列表项类型定义
export interface userList {
    user_id: number
    username: string
    type: string
    createTime: string
    phone?: string
    email?: string
    is_vip?: boolean
    age?: number
    gender?: string
    create_time: string
    update_time: string
    status: string
    avatar?: string
}

//管理员商品管理参数,筛选条件
export interface productCondition {
    productName?: string
    status?: string
}
export interface productOperation {
    product_id: number[]
    operation: string
}
//管理员商品管理列表项类型定义
export interface productList {
    product_id: number
    name: string
    price: number
    stock: number
    auditStatus: string
    seller_id: number
    seller_name: string
    category_id: number
    category_name: string
}

//管理员订单管理参数,筛选条件
export interface orderCondition {
    orderId?: number
    userId?: number
    year?: number
    month?: number
    day?: number
    status?: string
}
//管理员订单管理操作
export interface orderOperation {
    order_id: number[]
    operation: string
}
//管理员订单管理列表项类型定义
export interface orderList {
    orderId: number
    userId: number
    goodsName: string
    money: number
    status: string
    createTime: string
    userRefundReason?: string
    merchantReason?: string
}

//商品分类筛选条件
export interface categoryCondition {
    name?: string
    parent_name: number
}
//商品分类操作
export interface categoryOperation {
    category_id?: number[]
    newCategory?: category
    operation: string //只有删除、新增、修改操作
}
//商品分类列表项类型定义
export interface category {
    category_id?: number
    name: string
    parent_id: number
    parent_name: string
}

//优惠券管理
//无筛选规则,直接返回所有管理员的优惠券
//优惠券操作
export interface couponOperation {
    coupon_id?: number[]
    newCoupon?: couponList
    operation: string //包括删除、发放、新增操作
}
//优惠券列表项类型定义
export interface couponList {
    coupon_id?: number
    name: string
    type: string
    value: number
    min: number
}

//操作日志管理
//筛选条件
export interface logCondition {
    username?: string
    content?: string
    type?: string
}
//日志操作,无操作
//日志列表项类型定义
export interface logList {
    logId: number
    username: string
    role: string
    content: string
    type: string
    time: string
    result: string
}

//活动管理
//管理员活动管理参数,筛选条件
export interface activityCondition {
    name?: string
    category_name?: string
    type?: string
    status?: string
}
//活动操作
export interface activityOperation {
    activity_id?: number[]
    newActivity?: activityList
    operation: string
}
//h活动列表项类型定义
export interface activityList {
    actId?: number
    actName: string
    actType: string
    goodsName: string
    rule: string
    startTime: string
    endTime: string
    status: string
}

//评论管理
//筛选条件
export interface commentCondition {
    username?: string
    goodsName?: string
    status?: string
}
//评论操作
export interface commentOperation {
    comment_id?: number[]
    newComment?: commentList
    operation: string
}
//评论列表项类型定义
export interface commentList {
    comment_id?: number
    username: string
    goodsName: string
    content: string
    score: number
    createTime: string
    status: string
}






