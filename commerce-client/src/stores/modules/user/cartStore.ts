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
        const newList = res.data.items || [];
        // 保留旧的选中状态：用新数据覆盖旧数据，但保留旧数据的 selected 属性
        this.cartList = newList.map(newItem => {
          const oldItem = this.cartList.find(item => item.id === newItem.id);
          return {
            ...newItem,
            selected: oldItem ? oldItem.selected : false,
          };
        });
      }
    },
    
    // 2. 加入购物车 (供 detail.vue 调用)
    async addToCart(payload: { sku_id: number; quantity: number }) {
      const res = await reqAddToCart(payload);
      if (res.success) {
        ElMessage.success('成功加入购物车！');
        this.fetchCartList(); // 重新拉取最新数据
      } else {
        ElMessage.error(res.message || '加入购物车失败');
      }
      return res.success;
    },
    
    // 检查商品是否已在购物车中
    isInCart(sku_id: number): boolean {
      return this.cartList.some(item => item.sku_id === sku_id);
    },

    // 3. 改变数量
    async updateCount(cart_id: number, quantity: number) {
      const res = await reqUpdateCartCount({cart_id, quantity });
      if (res.success){
        ElMessage.success('数量修改成功！');
        // 重新拉取购物车以更新活动价格（满减等依赖数量的活动需要重新计算）
        this.fetchCartList();
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