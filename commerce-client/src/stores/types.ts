// 这里存放仓库数据的类型

// 用户基本数据仓库（loginStore）
import type { UserInfo } from '@/api/user/types';
export interface LoginState {
  token: string;
  userInfo: UserInfo;
}
// 用户仓库
import type { AddressItem, CartItem, Coupon, OrderInfo, FavoriteItem, MyCommentItem } from '@/api/user/types';
export interface UserState {
  addressList: AddressItem[];
  myCoupons: Coupon[];
  favoriteList: FavoriteItem[];
  commentList: MyCommentItem[];
  loading: boolean;
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

  currentProduct: ProductDetail;
  currentComments: CommentItem[];
}

// 购物车仓库
export interface CartState {
  cartList: CartItem[];
}

// 订单仓库
export interface OrderState {
  orderList: OrderInfo[];
}

// 公共商品分类仓库
export interface CategoryState {
  categoryTree: CategoryItem[];
}