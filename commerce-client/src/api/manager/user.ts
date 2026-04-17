import request from '@/utils/request'
import type { userCondition, userList, userOperation, pagination } from './type'

export const getManagerUserList = (params: userCondition = {}, page: number = 1, pageSize: number = 10) => {
    // 输入参数：管理员用户名和用户类型
    // 输出参数：用户列表，userList[]
    // 注意：用户列表中包含用户ID、用户名、用户类型、创建时间、手机号、邮箱、状态
    return request<{ userList: userList[], pagination: pagination }>({
        url: '/manager/userData',
        method: 'get',
        params: {
            ...params,
            page,
            pageSize
        }
    })
}
// 用户操作
export const updateManagerUserList = (data: userOperation) => {
    // 输入参数：userOperation类型，包含用户ID和新的状态
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/userData',
        method: 'post',
        data
    })
}