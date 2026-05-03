import request from '@/utils/request'
import type { productList, productOperation, productCondition, pagination, productCategory } from './type'

export const getMerchantProductList = (params: productCondition = {}, page: number = 1, pageSize: number = 10) => {
    // 输入参数：管理员用户名和用户类型
    // 输出参数：管理员展示数据，merchantShowData
    return request<{ productList: productList[], pagination: pagination, categoryList: productCategory[] }>({
        url: '/merchant/products',
        method: 'get',
        params: {
            ...params,
            currentPage: page,
            pageSize: pageSize
        }
    })
}

//商品操作
export const updateMerchantProductList = (data: productOperation) => {
    // 输入参数：productOperation类型，包含商品ID和新的状态；
    // operation表示操作类型
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/merchant/products',
        method: 'post',
        data: data
    })
}