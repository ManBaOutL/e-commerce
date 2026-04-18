// 商品模块接口类型定义
import type { BaseEntity } from '../types';
// 商品数据
import type { PageParams } from '../types';

/**
 * 商品查询参数接口
 */
export interface ProductQueryParams extends PageParams {
  // 1. 基础搜索
  keyword?: string;           // 商品名称模糊搜索
  category_id?: number;    // 分类 ID 筛选
  shop_id?: number;        // 店铺 ID 筛选
  status?: string;         // 商品状态 (如：通过)

  // 2. 价格区间
  minPrice?: number;       // 最低价
  maxPrice?: number;       // 最高价

  // 3. 时间区间 (对应 create_time)
  start_time?: string;      // 开始时间 (YYYY-MM-DD)
  end_time?: string;        // 结束时间 (YYYY-MM-DD)

  // 4. 排序相关
  // sortField: 排序字段，如 'price', 'create_time'
  // sortOrder: 'asc' (升序) 或 'desc' (降序)
  sort_field?: 'id' | 'sales' | 'price' | 'created_time';
  sort_order?: 'asc' | 'desc';
}
export interface Product extends BaseEntity {
  id?: number;
  name: string;
  price?: number | string;
  description?: string;
  image?: string;
  stock?: number;
  sales?: number;
  user_id?: number;
  category_id?: number;
  shop_id?: number;
  status: '待审核' | '通过' | '已驳回' | '下架';
}
export interface ResProductList {
  list: Product[];
  total: number;
}

// 定义分类项的接口
export interface CategoryItem {
  id: number;           // 分类ID (对应后端的 category_id)
  name: string;         // 分类名称
  parent_id: number;    // 父级ID
  children?: CategoryItem[]; // 二级分类 (树形结构特有)
}


/**
 * 活动 (activity 表)
 */
export interface Activity extends BaseEntity {
  actid: number;
  name: string;
  type: '满减' | '折扣' | '秒杀';
  goodsType_id: number;  // 商品类型id
  rule: string;
  status: number;
  value: number;
  min: number;
}

// SKU 规格选项
export interface SpecOption {
  value: string;
  stock_count: number;
}

// SKU 规格组 (如：颜色、版本)
export interface SpecGroup {
  name: string;
  options: SpecOption[];
}

// 具体的 SKU 单元
export interface SkuItem {
  sku_id: number;
  price: number;
  original_price: number;
  stock_count: number;
}

/**
 * 完整的商品详情接口 (SPU + SKU 聚合)
 */
export interface ProductDetail {
  id: number | null;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock_count: number;
  sales_count: number;
  rate: number;
  main_image: string;
  sub_images: string[];
  detail_images: string[];
  category_name?: string;
  // 复杂的字典类型定义
  spec_groups: Record<string, SpecGroup>;
  sku_list: Record<string, SkuItem>;
  params?: Array<{ name: string; value: string }>;
}

/**
 * 商品评论接口
 */
export interface CommentItem {
  id: number;
  score: number;
  comment_text: string;
  created_at: string;
  username: string;
  user_avatar: string;
  images?: string[];
  merchant_reply?: string;
  append_comment?: string;
  append_days?: number;
}



