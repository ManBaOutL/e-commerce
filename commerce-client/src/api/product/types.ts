// 商品模块接口类型定义

import type { ResParams } from '../types';

// 商品数据
export interface Product {
  id: number;
  name: string;
  price?: number;
  description?: string;
  image?: string;
  stock?: number;
  sales?: number;
  attrs?: Record<string, any>;
  user_id?: number;
  category_id?: number;
}
export interface ResProductList extends ResParams {
  data: Product[];
}

// 定义分类项的接口
export interface CategoryItem {
  id: number;
  name: string;
  parent_id: number | null;
  icon?: string;
  level: number;
  children?: CategoryItem[]; // 可选的子级数组
}