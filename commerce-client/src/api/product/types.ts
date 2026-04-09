// 商品模块接口类型定义
import type { BaseEntity } from '../types';
import type { ApiResponse } from '../types';

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
  sort_field?: 'price' | 'create_time' | 'sales';
  sort_order?: 'asc' | 'desc';
}

export interface Product extends BaseEntity {
  id: number;
  name: string;
  price?: number;
  description?: string;
  image?: string;
  stock?: number;
  sales?: number;
  // attrs?: Record<string, any>;
  user_id?: number;
  category_id?: number;
  shop_id: number;
  status: '待审核' | '通过' | '已驳回';
  specs?: ProductSpec[]; // 聚合规格数据
}

export interface ResProductList extends ApiResponse {
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

/**
 * 商品规格 (specification / product-specification)
 */
export interface ProductSpec {
  spec_id: number;
  name: string; // 规格名称如：颜色、尺寸
  scale: number; // 价格比例
  stock: number; // 对应规格库存
}

/**
 * 购物车项 (cart 表)
 */
export interface CartItem extends BaseEntity {
  cart_id: number;
  product_id: number;
  user_id: number;
  quantity: number;
  price: number;
  // 扩展展示字段
  product_name?: string;
  scale?: number;
  spec_name?: string;
}

/**
 * 优惠券 (coupon 表)
 */
export interface Coupon {
  coupon_id: number;
  user_id: number;
  type: '满减' | '折扣'; //
  discount_value?: number;
  min_order_amount?: number;
  status: '正常' | '已使用' | '已过期'; // 后续添加
  create_time: string;
  start_time: string;
  end_time: string;
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