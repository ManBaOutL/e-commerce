import request from '@/utils/request'
import type { activityCondition, activityOperation, activityList } from './type'


//活动管理
export const getActList = (params: activityCondition) => {
    // 输入参数：无
    // 输出参数：活动列表，包含活动ID、活动名称、活动类型、活动开始时间、活动结束时间、活动状态等信息   
    return request<activityList[]>({
        url: '/manager/actList',
        method: 'get',
        params
    })
}
export const updateActList = (data: activityOperation) => {
    // 输入参数：activityOperation类型，包含活动ID和操作类型；
    // operation表示操作类型，如"delete"（删除活动）、"add"（新增活动）等
    // 输出参数：更新结果，boolean
    return request<boolean>({
        url: '/manager/updateAct',
        method: 'post',
        data: data
    })
}