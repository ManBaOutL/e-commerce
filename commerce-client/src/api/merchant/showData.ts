import request from '@/utils/request'
import type { merchantShowData } from './type'

export const getMerchantShowData = () => {
    // 输入参数：管理员用户名和用户类型
    // 输出参数：管理员展示数据，merchantShowData
    return request<merchantShowData>({
        url: '/merchant/showData',
        method: 'get',
    })
}