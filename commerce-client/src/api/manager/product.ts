import request from '@/utils/request'
import type { productCondition, productList, productOperation, pagination } from './type'

//商品管理界面
export const getManagerProductList = (params: productCondition = {}, page: number = 1, pageSize: number = 10) => {
    // 输入参数：管理员商品管理参数
    // 输出参数：商品列表，productList[]
    // 注意：商品列表中包含商品ID、商品名称、商品价格、商品库存、商品审核状态、商品卖家ID、商品卖家名称、商品分类ID、商品分类名称
    return request<{ productList: productList[], pagination: pagination }>({
        url: '/manager/allProducts',
        method: 'get',
        params: {
            ...params,
            currentPage: page,
            pageSize
        }
    })
}

//商品操作
export const updateManagerProductList = (data: productOperation) => {
    // 输入参数：productOperation类型，包含商品ID和新的审核状态；
    // operation表示操作类型，如"approve"（审核通过）、"reject"（审核拒绝）、"delete"（删除商品）等
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/allProducts',
        method: 'post',
        data: data
    })
}