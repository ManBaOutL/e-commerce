import { defineStore } from "pinia";
import { 
  login, 
  alipayLogin, 
  register, 
  sendCode, 
  resetPassword,
} from '@/api/user';
import type { UserInfo } from '@/api/user/types';
import type { LoginState } from '@/stores/types';
import { useUserStore } from '@/stores/modules/user/userStore';
import { useOrderStore } from '@/stores/modules/user/orderStore';
import { useCartStore } from '@/stores/modules/user/cartStore';

export const useLoginStore = defineStore('loginStore', {
  state: () : LoginState => ({
    token: localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token') as string) : '',

    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') as string) : null,
  }),
  actions: {
    // 初始化的 action
    initStore() {
      // 这里的代码只有你手动调用时才会执行
      const localToken = localStorage.getItem('token');
      if (localToken) this.token = JSON.parse(localToken);
      
      const localUser = localStorage.getItem('userInfo');
      if (localUser) this.userInfo = JSON.parse(localUser);
    },

    // 1. 登录
    async loginAction(payload: any) {
      try {
        const res: any = await login(payload);
        // 假设状态码 200 或 success 为真代表成功，请根据你的实际接口调整
        if (res.status === 200 || res.success !== false) { 
          // 存储到 Pinia 状态
          this.token = res.data.token;
          this.userInfo = res.data.user;
          // 持久化到 localStorage
          localStorage.setItem('token', JSON.stringify(res.data.token));
          localStorage.setItem('userInfo', JSON.stringify(res.data.user));
          
          return { success: true, userType: res.data.user.type };
        }
        return { success: false, message: res.message || '登录失败' };
      } catch (error: any) {
        return { success: false, message: error?.message || '网络异常' };
      }
    },

    // 2. 彻底退出登录逻辑
    logout() {
      // 1. 物理清理：清除浏览器的本地缓存
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');

      // 2. 状态清理：清空当前登录 Store 的内存状态
      this.token = '';
      this.userInfo = { } as UserInfo;

      // 3. 业务清理：调用其他 Store 的 $reset()，一键恢复到初始空数组/空对象状态
      const userStore = useUserStore();
      userStore.$reset(); // 瞬间清空 addressList, myCoupons, favoriteList 等

      const orderStore = useOrderStore();
      orderStore.$reset(); // 瞬间清空 orderList

      // 如果有购物车 Store
      const cartStore = useCartStore();
      cartStore.$reset(); 
    },

    // 3. 注册
    async registerAction(payload: any) {
      try {
        const res: any = await register(payload);
        // 根据你的后端实际返回结构判断
        if (res.status === 200 || res.success !== false) {
          return { success: true };
        }
        return { success: false, message: res.message || '注册失败' };
      } catch (error: any) {
        return { success: false, message: error?.response?.data?.message || '网络异常' };
      }
    },

    // 4. 发送验证码
    async sendCodeAction(payload: { phone?: string; email?: string; scene: string }) {
      try {
        const res: any = await sendCode(payload);
        return { success: true, data: res.data };
      } catch (error: any) {
        return { success: false, message: error?.msg || '验证码发送失败' };
      }
    },

    // 5. 重置密码
    async resetPwdAction(payload: any) {
      try {
        const res: any = await resetPassword(payload);
        if (res.status === 200 || res.success !== false) {
          return { success: true };
        }
        return { success: false, message: res.message || '密码重置失败' };
      } catch (error: any) {
        return { success: false, message: '网络异常' };
      }
    },
   
    // 6. 支付宝登录
    async alipayLoginAction(auth_code: string) {
      try {
        
        // 假设直接用 axios/request 工具发送：
        const res: any = await alipayLogin({ auth_code });
        
        if (res.status === 200 || res.success !== false) {
          this.token = res.data.token;
          this.userInfo = res.data.user;
          localStorage.setItem('token', JSON.stringify(res.data.token));
          localStorage.setItem('userInfo', JSON.stringify(res.data.user));
          
          return { success: true, userType: res.data.user.type };
        }
        return { success: false, message: res.message || '支付宝登录失败' };
      } catch (error: any) {
        return { success: false, message: error?.message || '网络异常' };
      }
    },
  },
});