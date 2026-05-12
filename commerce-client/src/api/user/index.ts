// 用户模块接口
import request from '@/utils/request';
import type { LoginData, CodeData,ForgetCodeData, RegisterData, CommentSubmitData,CommentAppendData} from './types';
import type { CartListResponse,AddCartPayload, UpdateCartPayload, RemoveCartPayload } from './types';
import type { CreateOrderPayload, OrderInfo } from './types';
import type { AddressItem } from './types';
import type { ToggleFavoriteData } from './types';
import type { ApiResponse } from '@/api/types';

// 登录接口
export const login = (data: LoginData) => {
    return request({
        url: '/login',
        method: 'post',
        data
    })
}
export const alipayLogin = (data: { auth_code: string }) => {
    return request({
        url: '/alipayLogin',
        method: 'post',
        data
    })
}
//登录模拟接口
export const mockLogin = (data: LoginData) => {
    console.log("data: ", data);
    return request({
        url: '/users',
        method: 'get',
        params: {
            username: data.username,
            //password: data.password
        }
    })
}

//忘记密码接口
// 发送验证码
export const sendCode = (data: CodeData) => {
    return request({
        url: '/code',
        method: 'post',
        data
    })
}
// 重置密码
export const resetPassword = (data: ForgetCodeData) => {
    return request({
        url: '/forget',
        method: 'post',
        data
    })
}

// 注册接口
export const register = (data: RegisterData) => {
    return request({
        url: '/register',
        //url: 'http://localhost:10000/users',
        method: 'post',
        data
    })
}
export const reqGetUserInfo = () => {
  return request.get<any, ApiResponse<any>>(API.GET_USER_INFO);
}
export const reqUpdateUserInfo = (data: Record<string, any>) => {
    return request.post<any, ApiResponse<any>>(API.POST_USER_INFO, data);
}
export const reqUserRecharge = (data: { amount: number }) => {
    return request.post<any, ApiResponse<any>>(API.POST_USER_RECHARGE, data);
}
export const reqUserWithdraw = (data: { amount: number }) => {
    return request.post<any, ApiResponse<any>>(API.POST_USER_WITHDRAW, data);
}

enum API {
  LOGIN = '/login',
  CODE = '/code',
  FORGET = '/forget',
  REGISTER = '/register',
  GET_USER_INFO = 'user/profile/info',
  POST_USER_INFO = '/user/profile/update',
  POST_USER_RECHARGE = '/user/profile/recharge',
  POST_USER_WITHDRAW = '/user/profile/withdraw',
  // 用户评论
  POST_ADD_COMMENT = '/user/comment/add',
  GET_COMMENT_LIST = '/user/comment/list',
  POST_DELETE_COMMENT = '/user/comment/delete',
  POST_APPEND_COMMENT = '/user/comment/append',
  // 我的优惠券列表
  GET_MY_COUPONS = '/user/coupons/list',
  // 购物车
  GET_CART_LIST = '/user/cart/list',
  POST_ADD_TO_CART = '/user/cart/add',
  PUT_UPDATE_CART_COUNT = '/user/cart/update',
  POST_REMOVE_CART_ITEMS = '/user/cart/remove',
  // 订单
  POST_CREATE_ORDER = '/user/order/create',
  GET_ORDER_LIST = '/user/order/list',
  POST_PAY_EXISTING_ORDER = '/user/order/pay',
  POST_APPLY_REFUND = '/user/order/applyRefund',
  POST_CANCEL_ORDER = '/user/order/cancel',
  POST_CHECK_ALIPAY_STATUS = '/user/order/checkAlipayStatus',
  // 地址管理
  GET_ADDRESS_LIST = '/user/address/list',
  POST_ADD_ADDRESS = '/user/address/add',
  POST_UPDATE_ADDRESS = '/user/address/update',
  POST_DELETE_ADDRESS = '/user/address/delete',
  POST_SET_DEFAULT_ADDRESS = '/user/address/setDefault',
  // 收藏
  POST_TOGGLE_FAVORITE = '/user/favorite/toggle',
  GET_FAVORITES_LIST = '/user/favorite/list',
  POST_REMOVE_FAVORITES = '/user/favorite/remove',
  // 活动
  GET_FRONT_ACTIVITY_LIST = 'front/activity/list',
  // 统计数据
  GET_STATISTICS = '/user/statistics/list',
  // 其他接口...
  GET_SHOP_INFO = 'front/shop/',
  GET_SHOP_PRODUCTS = 'front/shop/'  , //front/shop/:id/products
}

// 提交商品评价
export const reqAddComment = (data: CommentSubmitData) => {
  // 这里的 URL 请替换为你后端实际配置的路由路径
  return request.post<any, ApiResponse<any>>(API.POST_ADD_COMMENT, data);
}
export const reqAppendComment = (data: CommentAppendData) => {
  // 这里的 URL 请替换为你后端实际配置的路由路径
  return request.post<any, ApiResponse<any>>(API.POST_APPEND_COMMENT, data);
}
// 提交商品评价
export const reqGetCommentList = () => {
  // 这里的 URL 请替换为你后端实际配置的路由路径
  return request.get<any, ApiResponse<any>>(API.GET_COMMENT_LIST);
}
// 提交商品评价
export const reqDeleteComment = (data: { review_id: number }) => {
  // 这里的 URL 请替换为你后端实际配置的路由路径
  return request.post<any, ApiResponse<any>>(API.POST_DELETE_COMMENT, data);
}

// 获取我的优惠券列表
export const reqGetMyCoupons = () => {
    return request.get<any, any>(API.GET_MY_COUPONS);
  }

  // 1. 获取购物车列表
export const reqGetCartList = () => {
  return request.get<any, ApiResponse<CartListResponse>>(API.GET_CART_LIST);
}

// 2. 加入购物车
export const reqAddToCart = (data: AddCartPayload) => {
  return request.post<any, ApiResponse<any>>(API.POST_ADD_TO_CART, data);
}

// 3. 更新数量
export const reqUpdateCartCount = (data: UpdateCartPayload) => {
  return request.put<any, ApiResponse<any>>(API.PUT_UPDATE_CART_COUNT, data);
}

// 4. 删除购物车商品
export const reqRemoveCartItems = (data: RemoveCartPayload) => {
  return request.post<any, ApiResponse<any>>(API.POST_REMOVE_CART_ITEMS, data);
}


// 创建订单
export const reqCreateOrder = (data: CreateOrderPayload) => {
  return request.post<any, any>(API.POST_CREATE_ORDER, data);
}
// 获取订单列表
export const reqGetOrderList = () => {
  return request.get<any, ApiResponse<OrderInfo[]>>(API.GET_ORDER_LIST);
}
// 继续支付未完成的订单
export const reqPayExistingOrder = (data: {order_id: string | number, payment_method: string}) => {
  return request.post<any, any>(API.POST_PAY_EXISTING_ORDER, data);
}
// 申请订单退款
export const reqApplyRefund = (order_id: number, refundReason: string) => {
  return request.post<any, ApiResponse<any>>(API.POST_APPLY_REFUND, { order_id, refundReason });
}
//  取消订单
export const reqCancelOrder = (order_id: number) => {
  return request.post<any, ApiResponse<any>>(API.POST_CANCEL_ORDER, { order_id });
}
// 检查支付宝支付状态
export const reqCheckAlipayStatus = (out_trade_no: number) => {
  return request.post<any, ApiResponse<any>>(API.POST_CHECK_ALIPAY_STATUS, { order_id: out_trade_no });
}
// ================== 地址管理相关接口 ==================

// 1. 获取当前用户的收货地址列表
export const reqGetAddressList = () => {
    return request.get<any, ApiResponse<any>>(API.GET_ADDRESS_LIST);
};

// 2. 新增收货地址
export const reqAddAddress = (data: AddressItem) => {
    return request.post<any, ApiResponse<any>>(API.POST_ADD_ADDRESS, data);
};

// 3. 修改收货地址
export const reqUpdateAddress = (data: AddressItem) => {
    return request.post<any, ApiResponse<any>>(API.POST_UPDATE_ADDRESS, data);
};

// 4. 删除收货地址
export const reqDeleteAddress = (address_id: number) => {
    return request.post<any, ApiResponse<any>>(API.POST_DELETE_ADDRESS, { address_id });
};

// 5. 设置为默认地址
export const reqSetDefaultAddress = (address_id: number) => {
    return request.post<any, ApiResponse<any>>( API.POST_SET_DEFAULT_ADDRESS, { address_id });
};


// 1. 切换收藏状态 
export const reqToggleFavorite = (sku_id: number) => {
  return request.post<any, ApiResponse<ToggleFavoriteData>>(API.POST_TOGGLE_FAVORITE, { sku_id })
};
// 2. 获取收藏列表
export const reqGetFavoriteList = () => {
  return request.get<any, ApiResponse<any>>(API.GET_FAVORITES_LIST);
};
// 3. 批量删除收藏 (传数组)
export const reqRemoveFavorite = (sku_ids: number[]) => {
  return request.post<any, ApiResponse<any>>(API.POST_REMOVE_FAVORITES, { sku_ids });
};

// 获取首页活动列表
export const reqGetFrontActivityList = () => {
  return request.get<any, ApiResponse<any>>(API.GET_FRONT_ACTIVITY_LIST);
};

// 获取统计数据
export const reqGetStatistics = (params: any) => {
  return request.get<any, ApiResponse<any>>(API.GET_STATISTICS, { params });
};


// 店铺相关
export const reqGetShopInfo = (shop_id: number | string) => {
  return request.get<any, ApiResponse<any>>(API.GET_SHOP_INFO + shop_id, { params: {  _t: Date.now() } });
}

export const reqGetShopProducts = (shop_id: number | string) => {
  return request.get<any, ApiResponse<any>>(API.GET_SHOP_PRODUCTS + shop_id + '/products', { params: { _t: Date.now() } });
}