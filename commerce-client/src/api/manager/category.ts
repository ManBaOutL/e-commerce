import request from '@/utils/request'
import type { categoryCondition, category, categoryOperation } from './type'

//商品分类管理
export const getManagerCategoryList = (params: categoryCondition) => {
    // 输入参数：商品分类筛选条件，categoryCondition类型，包含分类名称和父分类ID
    // 输出参数：分类列表，category[]   
    return request<category[]>({
        url: '/manager/categoryList',
        method: 'get',
        params
    })
}

export const updateManagerCategoryList = (data: categoryOperation) => {
    // 输入参数：categoryOperation类型，包含分类ID和操作类型；
    // operation表示操作类型，如"delete"（删除分类）等
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/updateCategory',
        method: 'post',
        data: data
    })
}