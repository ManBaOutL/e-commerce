import axios from 'axios';
// 🌟 核心修复 1：绝对不能在 Element Plus 项目里混用 ant-design-vue！
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api', 
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('token');
        if (token) {
            token = token.replace(/(^"|"$)/g, '');
            // 🌟 修复隐患：确保 headers 存在，防止深层报错
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const res = response.data;
        
        // 🌟 核心修复 2：兼容 304 空响应体的情况，防止 res.status 报错
        if (!res || res.status !== 200) {
            ElMessage.error(res?.message || '请求失败');
            return Promise.reject(res || 'Empty Response');
        }
        return res;
    },
    (error) => {
        console.error("响应拦截器error: ", error);
        // 🌟 统一使用 Element Plus 的提示组件
        // ElMessage.error('网络错误或接口不存在！');
        return Promise.reject(error);
    }
);

export default request;