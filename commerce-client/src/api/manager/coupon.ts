import request from '@/utils/request'
import type { couponOperation, couponList } from './type'

//优惠券管理
//获取优惠券列表
export const getManagerCouponList = () => {
    // 输入参数：无
    // 输出参数：所有管理员的优惠券列表，couponList[]
    return request<couponList[]>({
        url: '/manager/couponList',
        method: 'get',
    })
}
//优惠券操作
export const updateManagerCouponList = (data: couponOperation) => {
    // 输入参数：couponOperation类型，包含优惠券ID和操作类型；
    // operation表示操作类型，如"delete"（删除优惠券）、"issue"（发放优惠券）、"add"（新增优惠券）等    
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/updateCoupon',
        method: 'post',
        data: data
    })
}