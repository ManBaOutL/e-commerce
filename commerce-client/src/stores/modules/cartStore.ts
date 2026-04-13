import { defineStore } from 'pinia'
import { useCouponStore } from './couponStore'
import type { CartState } from '../types';

export const useCartStore = defineStore('cart', {
  state: () : CartState => ({
    // 购物车商品列表（包含 product 表和 product-specification 表的 scale）
    cartList: []
  }),

  getters: {
    // 1. 基础原始总价：∑(商品单价 * 规格比例 * 数量)
    rawTotalPrice: (state) : number => {
      return state.cartList.reduce((sum, item) => {
        const price = item.price * (item.scale || 1)
        return sum + price * item.quantity
      }, 0)
    },

    // 2. 最终应付金额：原始价 - 优惠券减免
    finalPayAmount(): number {
      const couponStore = useCouponStore()
      
      // 现在这里可以通过 this 访问到上面的 rawTotalPrice 了
      let total = this.rawTotalPrice

      if (couponStore.selectedCoupon) {
        const { type, discount_value = 0 } = couponStore.selectedCoupon
        if (type === '满减') {
          total -= discount_value
        } else if (type === '折扣') {
          total = total * (discount_value / 10)
        }
      }
      return total > 0 ? total : 0
    }
  },

  actions: {
    // 同步后端购物车数据
    setCartList(list: any[]) {
      this.cartList = list
    },
    // 添加/修改数量
    updateQuantity(productId: number, num: number) {
      const item = this.cartList.find(i => i.product_id === productId)
      if (item) item.quantity += num
    }
  }
})