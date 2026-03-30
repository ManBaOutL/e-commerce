import axios from 'axios';
import { message } from 'ant-design-vue';

// 创建 axios 实例
const request = axios.create({
    //baseURL: 'http://127.0.0.1:8888/api', // 后端接口基础地址
    baseURL: 'http://localhost:8887', // 后端接口基础地址
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器：请求发送前的处理（比如添加 token）
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器：统一处理后端返回结果
request.interceptors.response.use(
    (response) => {
        // 后端返回的原始数据
        const res = response.data;
        // console.log("res: ", res);
        // 假设后端约定 status=200 为成功
        // if (res.status !== 200) {

        //     message.error(res.message || '请求失败');
        //     return Promise.reject(res);
        // }
        return res;
    },
    (error) => {
        //console.log("error: ", error);
        message.error('网络错误或接口不存在！');
        return Promise.reject(error);
    }
);

export default request;