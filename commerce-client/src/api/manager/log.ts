import request from '@/utils/request'
import type { logCondition, logList } from './type'

//操作日志管理
export const getLogList = (params: logCondition) => {
    // 输入参数：无
    // 输出参数：操作日志列表，包含日志ID、用户名、用户角色、操作内容、操作类型、操作时间和操作结果等信息   
    return request<logList[]>({
        url: '/manager/allopreationlogs',
        method: 'get',
        params
    })
}
//日志操作,暂无操作接口
