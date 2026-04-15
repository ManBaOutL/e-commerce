import request from '@/utils/request'
import type { orderCondition, orderList, orderOperation, pagination } from './type'

//订单管理
//获取订单列表
export const getManagerOrderList = (params: orderCondition = {}, page: number = 1, pageSize: number = 10) => {
    // 输入参数：管理员订单管理参数，orderCondition类型，包含最近几天的数据，默认为7天
    // 输出参数：订单列表，orderList[]
    return request<{ orderList: orderList[], pagination: pagination }>({
        url: '/manager/allorder',
        method: 'get',
        params: {
            ...params,
            currentPage: page,
            pageSize: pageSize
        }
    })
}
//订单操作
export const updateManagerOrderList = (data: orderOperation) => {
    // 输入参数：orderOperation类型，包含订单ID和新的状态；
    // operation表示操作类型
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/allorder',
        method: 'post',
        data: data
    })
}