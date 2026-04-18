// 用户模块接口类型定义

import type { BaseEntity } from '../types';

//登陆数据
export interface LoginData {
    username?: string,
    password: string,
    email?: string,
    phone?: string
}

//验证码数据
export interface CodeData {
    phone?: string,
    email?: string,
    scene: string // 场景：forget,register...
}

// 忘记密码表单数据
export interface ForgetCodeData {
    phone?: string,
    code?: string,
    newPwd?: string,
    repeatPwd?: string,
    email?: string,
    type: string
}

// 注册表单数据
export interface RegisterData {
    phone?: string,
    code: string,
    username: string,
    email?: string,
    password: string,
    repassword: string,
    type: string
}

/**
 * 用户基本信息
 */
export interface UserInfo extends BaseEntity {
  user_id: number;
  username: string;
  type: 'admin' | 'user' | 'merchant'  | '管理员' | '普通用户' | '商家'; // 根据业务扩展
  email?: string;
  phone?: string;
  age?: number;
  gender?: '男' | '女' | '保密'; // 0:未知, 1:男, 2:女
  is_vip: 0 | 1;
  img?: string; // 用户头像
}

/**
 * 地址信息 (对应 address 表)
 */
export interface AddressItem {
  address_id?: number;      // 新增时没有这个ID，所以设为可选
  user_id?: number;
  recipient_name: string;   // 收货人姓名
  phone: string;            // 手机号
  province: string;         // 省
  city: string;             // 市
  district: string;         // 区
  street: string;           // 街道
  streetNumber: string;     // 门牌号
  address: string;          // 完整拼接地址 (用于地图显示)
  lng: number;              // 经度
  lat: number;              // 纬度
  type: string;             // 🌟 地址标签：'家' | '公司' | '学校' | '其他'
  is_default: boolean;      // 是否默认
  create_time?: string;      // 创建时间
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
  status: '未使用' | '已使用' | '已过期' | '已创建'; // 后续添加
  create_time: string;
  start_time: string;
  end_time: string;
}

// 提交商品评价
export interface CommentSubmitData {
  order_id: string;
  product_id: number;
  rating: number;
  content: string;
  images?: string; // 逗号分隔的图片路径
  video?: string;  // 视频路径
}

/**
 * 购物车单条商品项 (聚合了 SPU, SKU 和 Cart 表数据)
 */
export interface CartItem {
  // --- 购物车基础信息 ---
  id: number;           // 购物车记录的唯一ID (对应数据库的 cart_id)
  count: number;        // 购买数量 (对应数据库的 quantity)
  
  // --- 商品与规格关联信息 ---
  product_id: number;   // SPU ID (用于点击跳转商品详情)
  sku_id: number;       // SKU ID (下单结算时真正需要的 ID)
  
  // --- 界面展示信息 (联表查出) ---
  name: string;         // 商品主名称 (SPU name)
  spec: string;         // 规格名称 (如 "256GB 原色钛金属")
  price: number;        // 该规格的当前真实价格
  main_image: string;   // 商品主图 (动态扫描文件夹获得)
  
  // --- 核心校验字段 (决定商品是否失效) ---
  stock: number;        // 该规格的实时库存
  product_status: '待审核' | '通过' | '已驳回' | '下架'; // 商品当前的状态
  
  // --- 前端专属交互字段 (后端不存，前端自动挂载) ---
  selected?: boolean;   // 是否被勾选 (用于结算和删除)
}
/**
 * 1. 加入购物车请求参数
 */
export interface AddCartPayload {
  sku_id: number;       // 必须是具体的规格 ID
  quantity: number;     // 加入的数量
}

/**
 * 2. 更新购物车数量请求参数
 */
export interface UpdateCartPayload {
  cart_id: number;      // 要修改的那条购物车记录的 ID
  quantity: number;     // 修改后的最终数量
}

/**
 * 3. 批量删除购物车请求参数
 */
export interface RemoveCartPayload {
  cart_ids: number[];   // 购物车 ID 数组，例如 [1, 5, 8]
}


// 下单参数类型定义 (兼容购物车结算与直接购买)
export interface CreateOrderPayload {
  address_id: number;
  coupon_id: number | null;
  total_amount: string | number;
  // 购物车结算专用
  cart_ids?: number[]; 
  // 直接购买专用
  direct_buy?: {
    product_id: number;
    sku_id: number;
    quantity: number;
    price: string | number;
  };
}
/**
 * 订单明细中的单个商品信息
 */
export interface OrderDetailItem {
  product_id: number;          // 商品 SPU ID
  product_name: string;        // 商品名称
  price: number | string;      // 购买时的真实单价
  quantity: number;            // 购买数量
  main_image?: string;         // 商品主图（可选，如果后端查出来了的话）
  spec?: string;               // 规格名称（如 "256G 钛金属"，如果在列表中需要展示的话）
}
// 订单使用的优惠券信息
export interface OrderCouponInfo {
  name: string;                // 优惠券名称
  discount: number | string;   // 抵扣金额
}
export type OrderStatus = '待支付' | '待发货' | '已发货' | '已完成' | '已取消' | '申请退款' |  '已退款' | '待审核' | '退款驳回';

export interface OrderInfo {
  order_id: number;            // 订单流水号 
  total_amount: number;        // 订单实付总金额
  status: OrderStatus;         // 当前订单状态
  create_time: string;         // 订单创建时间 (YYYY-MM-DD HH:mm:ss格式)
  
  // 嵌套结构
  coupon: OrderCouponInfo | null; // 使用的优惠券（没用就是 null）
  details: OrderDetailItem[];     // 订单包含的商品列表
  
  // (可选) 如果你以后需要在列表中展示收货地址，可以加上这个
  address?: {
    recipient_name: string;
    phone: string;
    address_line1: string;
    city: string;
    state: string;
  };
}


// 单个收藏商品的类型定义
export interface FavoriteItem {
  id: number;           // 对应后端的 sku_id，用于唯一标识和加购物车
  product_id: number;   // 对应商品主表 ID，用于点击跳转详情页
  name: string;         // 拼接后的完整商品名 (例如: "无线蓝牙耳机 经典黑")
  price: number;        // SKU 实际价格
  image: string;        // 商品主图路径
  stock: number;        // 当前 SKU 库存 (用于 UI 判断是否展示"暂时无货"遮罩)
  status: number;       // 商品状态：1 正常，0 下架/失效 (用于 UI 判断"已下架"遮罩)
  create_time: string;  // 收藏创建时间

  // 以下是你前端 UI 写死的数据中有，但当前数据库没直接查出来的辅助字段，设为可选参数 (?)
  oldPrice?: number;    // 原价/划线价
  tag?: string;         // 促销标签 (例如 "降价100元")
}

// 🌟 切换收藏状态接口的返回数据类型
export interface ToggleFavoriteData {
  is_favorite: boolean;
}