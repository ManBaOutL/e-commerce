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
  type: 'admin' | 'user' | 'merchant'; // 根据业务扩展
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
export interface AddressItem extends BaseEntity {
  address_id: number;
  user_id: number;
  recipient_name: string;
  phone: string;
  address: string;
  // 高德地图字段
  lng: number;
  lat: number;
  province: string;
  city: string;
  district: string;
  street: string;
  streetNumber: string;
  is_default: boolean;
  type?: string; 
}