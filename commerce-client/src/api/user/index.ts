// 用户模块接口
import request from '@/utils/request';
import type { LoginData, CodeData, RegisterData, CommentSubmitData } from './types';
import type { ApiResponse } from '@/api/types';
import type { ForgetCodeData } from './types';

// 登录接口
export const login = (data: LoginData) => {
    return request({
        url: '/login',
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

enum API {
  LOGIN = '/login',
  CODE = '/code',
  FORGET = '/forget',
  REGISTER = '/register',
  USERS = '/users',
  POST_ADD_COMMENT = '/api/user/product/comment/add',
}
// 提交商品评价
export const reqAddComment = (data: CommentSubmitData) => {
  // 这里的 URL 请替换为你后端实际配置的路由路径
  return request.post<any, ApiResponse<any>>(API.POST_ADD_COMMENT, data);
}
