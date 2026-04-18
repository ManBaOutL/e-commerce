import request from '@/utils/request'
import type { logCondition, logList, pagination } from './type'

//操作日志管理
export const getLogList = (params: logCondition = {}, page: number = 1, pageSize: number = 10) => {
    return request<{ log: logList[], allType: string[], pagination: pagination }>({
        url: '/manager/alloperationlogs',
        method: 'get',
        params: {
            ...params,
            currentPage: page,
            pageSize
        }
    })
}
//日志操作,暂无操作接口
