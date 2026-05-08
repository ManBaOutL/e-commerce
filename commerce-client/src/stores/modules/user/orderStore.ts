import { defineStore } from 'pinia';
import type { CreateOrderPayload } from '@/api/user/types';
import type { OrderState } from '@/stores/types';
import { reqCreateOrder, reqGetOrderList, reqPayExistingOrder, reqApplyRefund, reqCancelOrder } from '@/api/user';
import { ElMessage } from 'element-plus';

export const useOrderStore = defineStore('order', {
  state: () : OrderState => ({
    orderList: []
  }),
  getters: {

  },
  actions: {
    // 拉取订单列表
    async fetchOrderList() {
      try {
        const res = await reqGetOrderList();
        if (res.success) {
          this.orderList = res.data;
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
      }
    },
    
    // 提交创建订单
    async submitOrder(payload: CreateOrderPayload) {
      try {
        const res = await reqCreateOrder(payload);
        if (res.success) {
          return { success: true, order_id: res.data.order_id };
        } else {
          ElMessage.error(res.message || '支付失败');
          return { success: false };
        }
      } catch (error) {
        ElMessage.error('支付请求出错');
        return { success: false };
      }
    },

    // 继续支付已存在的订单
    async payExistingOrder(order_id: string | number, payment_method: string) {
      try {
        // ⚠️ 注意：你需要同步去你的 src/api/user/index.ts 中，把 reqPayExistingOrder 的参数改成接收这两个值
        const res = await reqPayExistingOrder({ order_id, payment_method });
        if (res.success) {
          // 🌟 如果是支付宝，把后端的 url 原封不动返回给 Vue 组件
          return { success: true, url: res.url || null }; 
        } else {
          return { success: false, message: res.message };
        }
      } catch (error) {
        return { success: false, message: '支付异常' };
      }
    },

    // 申请退款 (修正参数名)
    async applyRefund(order_id: number, refundReason: string) {
      try {
        // 🌟 这里的 payload 属性名必须和后端解构的名字一致
        const res = await reqApplyRefund(order_id, refundReason)
        if (res.success) {
          return { success: true };
        } else {
          return { success: false, message: res.message };
        }
      } catch (error: any) {
        return { success: false, message: error.message || '申请退款异常' };
      }
    },

    async cancelOrder(order_id: number) {
      try {
        const res = await reqCancelOrder(order_id);
        if (res.success) {
          return { success: true };
        } else {
          return { success: false, message: res.message };
        }
      } catch (error: any) {
        return { success: false, message: error.message || '取消订单异常' };
      }
    },
  }
});
