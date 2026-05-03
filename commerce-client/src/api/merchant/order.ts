import request from '@/utils/request';
import type { 
  OrderCondition, 
  RefundOperation, 
  MerchantOrderListResData,
  RefundResData
} from './type';
import type { ApiResponse } from '@/api/types';

/**
 * 1. 获取商家订单列表
 * @param params 查询条件 (status: 订单状态)
 * 🌟 约束返回值：Promise<ApiResponse<MerchantOrderListResData>>
 * @param pageSize 每页条数
 * 🌟 约束返回值：Promise<BaseResponse<MerchantOrderListResData>>
 */
export const getMerchantOrderList = (params: OrderCondition, page: number = 1, pageSize: number = 10) => {
  return request<any, ApiResponse<MerchantOrderListResData>>({
    url: '/merchant/orders', 
    method: 'GET',
    params: {
      ...params,
      page,
      pageSize
    }
  });
};

/**
 * 2. 商家处理退款 (同意 / 驳回)
 * 🌟 约束返回值：如果仅成功不返回复杂数据，data 就是 null；如果是同意退款，返回退款金额
 */
export const handleMerchantRefund = (data: RefundOperation) => {
  return request<any, ApiResponse<RefundResData | null>>({
    url: '/merchant/orders/refund/audit', 
    method: 'POST',
    data
  });
};

/**
 * 3. 商家订单发货
 * 🌟 约束返回值：操作类接口，成功时 data 通常为 null
 */
export const shipMerchantOrder = (data: { order_id: string | number }) => {
  return request<any, ApiResponse<null>>({
    url: '/merchant/orders/ship', 
    method: 'POST',
    data
  });
};