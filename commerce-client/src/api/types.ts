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