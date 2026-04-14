import request from '@/utils/request';
import type { ApiResponse } from '@/api/types';
import type { ResProductList, CategoryItem } from '@/api/product/types';

enum API{
  GET_PRODUCT = '/front/product/list',
  GET_CATEGORY = '/front/product/category',
}

// 搜索商品（支持完整的json-server查询语法）
export const reqGetProducts = (params: any) => {
  return request.get<any, ApiResponse<ResProductList>>(API.GET_PRODUCT, { params });
};
export const reqGetCategories = () => {
  return request.get<any, ApiResponse<CategoryItem[]>>(API.GET_CATEGORY);
};



