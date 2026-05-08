/**
 * 全局通用响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

/**
 * 订单状态类型定义
 */
export type OrderStatus = '待支付' | '待发货' | '已发货' | '已完成' | '已取消' | '申请退款' |  '已退款' | '待审核' | '退款驳回';


/**
 * 通用分页请求/返回
 */
export interface PageParams {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  total: number;
  list: T[];
}

/**
 * 数据库通用时间戳
 */
export interface BaseEntity {
  create_time?: string;
  update_time?: string;
}