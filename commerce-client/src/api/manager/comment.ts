// 管理员相关接口
import request from '@/utils/request'
import type { commentCondition, commentList, commentOperation, pagination } from './type'


//评论管理
export const getManagerCommentList = (params: commentCondition = {}, page: number = 1, pageSize: number = 10) => {
    // 输入参数：评论筛选条件，commentCondition类型，包含用户名、商品名称、评论状态等
    // 输出参数：评论列表，commentList[]
    return request<{ commentList: commentList[], pagination: pagination }>({
        url: '/manager/allcomments',
        method: 'get',
        params: {
            ...params,
            currentPage: page,
            pageSize
        }
    })
}
export const updateManagerCommentList = (data: commentOperation) => {
    // 输入参数：commentOperation类型，包含评论ID和操作类型；
    // operation表示操作类型，如"delete"（删除评论）、"approve"（审核通过）、"reject"（审核拒绝）等
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/allcomments',
        method: 'post',
        data: data
    })
}



