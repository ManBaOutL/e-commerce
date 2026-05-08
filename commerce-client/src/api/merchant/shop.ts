import request from '@/utils/request'
import type { merchant, shop, shopOperation } from './type'

export const getShopInfo = () => {
    // 输入参数：管理员用户名和用户类型
    // 输出参数：管理员展示数据，merchantInfo
    return request<{ merchant: merchant, shop: shop }>({
        url: '/merchant/shop',
        method: 'get',
    })
}

export const updateShopInfo = (operation: shopOperation) => {
    console.log("商家更新店铺信息请求体1111111111111: ", operation)
    // 输入参数：管理员用户名和用户类型
    // 输出参数：管理员展示数据，merchantInfo
    return request<boolean>({
        url: '/merchant/shop',
        method: 'post',
        data: operation
    })
}