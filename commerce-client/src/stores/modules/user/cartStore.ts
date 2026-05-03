import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { reqGetCartList, reqAddToCart, reqUpdateCartCount, reqRemoveCartItems } from '@/api/user';
import type { CartState } from '@/stores/types';

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    cartList: [],
  }),
  actions: {
    // 1. 拉取购物车数据
    async fetchCartList() {
      const res = await reqGetCartList();
      if (res.success) {
        this.cartList = res.data.items || [];
      }
    },
    
    // 2. 加入购物车 (供 detail.vue 调用)
    async addToCart(payload: { sku_id: number; quantity: number }) {
      const res = await reqAddToCart(payload);
      if (res.success) {
        ElMessage.success('成功加入购物车！');
        this.fetchCartList(); // 重新拉取最新数据
      }
      return res.success;
    },

    // 3. 改变数量
    async updateCount(cart_id: number, quantity: number) {
      const res = await reqUpdateCartCount({cart_id, quantity });
      // 此处不需要重新 fetch，前端已双向绑定更新
      if (res.success){
        ElMessage.success('数量修改成功！');
      }
    },

    // 4. 删除商品
    async removeItems(cart_ids: number[]) {
      const res = await reqRemoveCartItems({ cart_ids });
      if (res.success) {
        ElMessage.success('删除成功');
        this.fetchCartList(); 
      }
    }
  }
});