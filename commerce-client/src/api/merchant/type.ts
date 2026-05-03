import type { OrderStatus } from '../types';
export interface pagination {
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
}

export interface showCondition {
    day?: number // 最近几天的数据，默认为7天
}

export interface merchantInfo {
    id: number,
    nickname: string,
    phone?: string,
    email?: string,
    hasShop: boolean,
    shopInfo?: {
        shopName: string,
        description: string,
        phone: string
    }
}

// 商家展示数据类型定义
export interface merchantShowData {
    //总体数据
    goodsCount: number
    orderCount: number
    waitSend: number
    sumOrderAmount: number
    // 图表数据
    xData: string[]
    orderData: number[]
    saleData: number[]
    pieData: { categoryName: string, value: number }[]
}

export interface productList {
    product_id: number,
    name: string,
    price: number,
    stock: number,// 库存数量，可能要用到触发器更新库存
    categoryName: string,
    rate: number,
    desc: string,
    img?: string,
    auditStatus: string,
    specs: [
        {
            name: string,
            price: number,
            stock: number
        }
    ]
}

export interface productOperation {
    product_id?: number,
    operation: string,
    product?: productList
}

export interface productCondition {
    categoryName?: string,
    name?: string,
    stock?: number
}

export interface productCategory {
    name: string,
}


// 商家订单列表项
export interface MerchantOrder {
    orderId: string;
    goodsName: string;
    money: string | number;
    status: OrderStatus;
    userName?: string;
    userPhone?: string;
    createTime?: string;
    address?: string;
    userRefundReason?: string;
    refundRejectReason?: string;
}

// 订单查询条件
export interface OrderCondition {
    status?: string;
    orderId?: string;
}

// 退款操作载荷
export interface RefundOperation {
    order_id: string;
    is_agree: boolean;      // true 同意, false 驳回
    reject_reason?: string; // 驳回时必填
}

// 商家订单列表返回数据类型
export interface MerchantOrderListResData {
    list: MerchantOrder[];
    pagination: pagination; // 复用你文件顶部已有的 pagination 接口
}
// 退款审核结果返回数据类型
export interface RefundResData {
    refundAmount: number;
}