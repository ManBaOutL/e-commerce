import request from '@/utils/request'
import type { managerShowData } from './type'

export const getManagerShowData = () => {
    // 输入参数：管理员用户名和用户类型
    // 输出参数：管理员展示数据，managerShowData
    return request<managerShowData>({
        url: '/manager/showData',
        method: 'get',
    })
}