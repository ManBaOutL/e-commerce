// 这里存放仓库数据的类型
// 用户仓库
import type { AddressItem } from '@/api/user/types';
export interface UserState {
  addressList: AddressItem[];
}

// 商品仓库
import type { Product,CategoryItem,ProductQueryParams  } from '@/api/product/types';
import type { ProductDetail, CommentItem } from '@/api/product/types';

export interface ProductState {
  productList: Product[];
  total: number;
  loading: boolean;
  finished: boolean;
  currentParams: ProductQueryParams;

  currentProduct: ProductDetail,
  currentComments: CommentItem[]
}

// 购物车仓库
import type { CartItem } from '@/api/product/types';

export interface CartState {
  cartList: CartItem[];
}

// 优惠券仓库
import type { Coupon } from '@/api/product/types';

export interface CouponState {
  userCoupons: Coupon[];
  selectedCouponId: number | null;
}

// 公共商品分类仓库
export interface CategoryState {
  categoryTree: CategoryItem[];
}