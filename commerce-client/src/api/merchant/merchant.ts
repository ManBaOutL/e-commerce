import request from '@/utils/request'
import type { merchantInfo } from './type'

export const getMerchantInfo = () => {
    // 输入参数：管理员用户名和用户类型
    // 输出参数：管理员展示数据，merchantInfo
    return request<merchantInfo>({
        url: '/merchant/info',
        method: 'get',
    })
}

export const createShop = (data: merchantInfo) => {
    // 输入参数：管理员用户名和用户类型
    // 输出参数：管理员展示数据，merchantInfo
    return request<merchantInfo>({
        url: '/merchant/info',
        method: 'post',
        data
    })
}