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

// 管理员展示数据类型定义
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

