import request from '@/utils/request';
import type { ApiResponse } from '@/api/types';
import type { ResProductList, CategoryItem } from '@/api/product/types';
import type { ProductDetail, CommentItem } from '@/api/product/types';

enum API{
  GET_PRODUCT = '/front/product/list',
  GET_CATEGORY = '/front/product/category',
  GET_PRODUCT_DETAIL = '/front/product/detail',
  GET_PRODUCT_COMMENTS = '/front/product/comments',
}

// 搜索商品（支持完整的json-server查询语法）
export const reqGetProducts = (params: any) => {
  return request.get<any, ApiResponse<ResProductList>>(API.GET_PRODUCT, { params });
};
export const reqGetCategories = () => {
  return request.get<any, ApiResponse<CategoryItem[]>>(API.GET_CATEGORY);
};
//  获取商品详情 (返回数据明确标注为 ProductDetail)
export const reqGetProductDetail = (id: number) => {
  return request.get<any, ApiResponse<ProductDetail>>(API.GET_PRODUCT_DETAIL + `/${id}`);
}

//  获取商品评价 (返回数据明确标注为 CommentItem 数组)
export const reqGetProductComments = (id: number) => {
  return request.get<any, ApiResponse<CommentItem[]>>(API.GET_PRODUCT_COMMENTS + `/${id}`);
}


