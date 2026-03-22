// 用户模块接口类型定义
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