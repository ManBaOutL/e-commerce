import request from '@/utils/request'
import type { couponOperation, couponList, couponCondition, pagination } from './type'

//优惠券管理
//获取优惠券列表
export const getManagerCouponList = (data: couponCondition = {}, page: number, pageSize: number, isTemplate: boolean = true) => {
    // 输入参数：无
    // 输出参数：所有管理员的优惠券列表，couponList[]
    return request<{ list: couponList[], pagination: pagination }>({
        url: '/manager/allcoupons',
        method: 'get',
        params: {
            ...data,
            currentPage: page,
            pageSize: pageSize,
            isTemplate: isTemplate
        }
    })
}
//优惠券操作
export const updateManagerCouponList = (data: couponOperation, isTemplate: boolean = true) => {
    // 输入参数：couponOperation类型，包含优惠券ID和操作类型；
    // operation表示操作类型，如"delete"（删除优惠券）、"issue"（发放优惠券）、"add"（新增优惠券）等    
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/allcoupons',
        method: 'post',
        data: {
            ...data,
            isTemplate: isTemplate
        }
    })
}