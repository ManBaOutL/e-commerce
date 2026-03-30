import request from '@/utils/request';

enum API{
  GET_PRODUCT = '/products',
  GET_CATEGORY = '/categories',
}

// 搜索商品（支持完整的json-server查询语法）
export const reqGetProducts = (params?: any) => {
  // 构建查询参数
  const queryParams: any = {};
  
  // !!! json-server 关联关系不好执行，所以后端部分实现了 category_id 的过滤功能，前端直接传 category_id 即可
  // 父子关系也暂时不实现
  if (params?.category_id) {
    queryParams.category_id = params.category_id;
  }
  // keyword搜索具体通过后端实现（暂未实现）
  if (params?.keyword) {
    queryParams.name_like = params.keyword;
  }
  if (params?.price_gte !== undefined) {
    queryParams.price_gte = params.price_gte;
  }
  if (params?.price_lte !== undefined) {
    queryParams.price_lte = params.price_lte;
  }
  // json-server 排序功能不响应，在后端部分实现
  // if (params?._sort) {
  //   queryParams._sort = params._sort;
  //   queryParams._order = params._order || 'asc';
  // }
  if (params?._page && params?._per_page) {
    queryParams._per_page = params._per_page;
    queryParams._page = params._page;
  }
  // console.log("查询参数: ", queryParams);
  return request.get<any, any>(API.GET_PRODUCT, { params: queryParams });
};

export const reqGetCategories = () => {
  return request.get<any, any>(`${API.GET_CATEGORY}`);
}




