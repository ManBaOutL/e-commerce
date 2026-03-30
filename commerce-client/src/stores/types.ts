// 这里存放仓库数据的类型
// 用户仓库

// 商品仓库
import type { Product,CategoryItem } from '@/api/product/types';

export interface ProductState {
  categoryList: CategoryItem[];
  categoryTree: CategoryItem[];
  productList: Product[];
  total: number;
}